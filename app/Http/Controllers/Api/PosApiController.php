<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\PosCheckoutRequest;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\POS\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PosApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->string('search'));
        $category = trim((string) $request->string('category', 'all'));

        $products = Product::query()
            ->where('status', 'active')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('barcode', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => $this->mapProduct($product))
            ->filter(fn (array $product) => $category === 'all' || strtolower($product['category']) === strtolower($category))
            ->values();

        $categories = $products
            ->pluck('category')
            ->unique()
            ->sort()
            ->values();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
            'summary' => [
                'total_products' => $products->count(),
                'low_stock_products' => $products->where('stock_status', 'critical')->count(),
                'categories_count' => $categories->count(),
            ],
            'recentTransactions' => Transaction::query()
                ->with(['user:id,name', 'details.product:id,barcode,name'])
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->whereIn('payment_status', [PaymentStatus::Paid->value, PaymentStatus::Pending->value])
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (Transaction $transaction) => $this->mapTransaction($transaction))
                ->values(),
        ]);
    }

    public function checkout(PosCheckoutRequest $request, TransactionService $transactionService): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $paymentMethod = PaymentMethod::from($validated['payment_method']);
        $cashReceived = (float) ($validated['cash_received'] ?? 0);
        $discount = (float) ($validated['discount'] ?? 0);

        $productIds = collect($validated['items'])->pluck('product_id')->all();
        $products = Product::query()
            ->where('status', 'active')
            ->whereIn('id', $productIds)
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        [$transaction, $receiptItems, $subtotal, $tax, $safeDiscount, $total] = DB::transaction(function () use (
            $validated,
            $paymentMethod,
            $cashReceived,
            $discount,
            $products,
            $transactionService,
            $user
        ) {
            $items = collect($validated['items'])
                ->groupBy('product_id')
                ->map(fn ($group) => [
                    'product_id' => (int) $group->first()['product_id'],
                    'quantity' => (int) $group->sum('quantity'),
                ])
                ->values()
                ->all();

            $subtotal = 0;
            $receiptItems = [];

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    abort(422, 'Product not found.');
                }

                if ($product->stock < $item['quantity']) {
                    abort(422, "Insufficient stock for {$product->name}.");
                }

                $lineSubtotal = $item['quantity'] * (float) $product->selling_price;
                $subtotal += $lineSubtotal;

                $receiptItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'barcode' => $product->barcode,
                    'quantity' => $item['quantity'],
                    'price' => (float) $product->selling_price,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $tax = round($subtotal * 0.11, 2);
            $safeDiscount = min(max($discount, 0), $subtotal + $tax);
            $total = max($subtotal + $tax - $safeDiscount, 0);

            if ($paymentMethod === PaymentMethod::Cash && $cashReceived < $total) {
                abort(422, 'Cash received is not enough for this transaction.');
            }

            $transaction = $transactionService->createDraft($user);
            $transaction->forceFill([
                'subtotal_price' => $subtotal,
                'tax_price' => $tax,
                'discount_price' => $safeDiscount,
                'total_price' => $total,
                'cash_received' => $cashReceived,
                'change_amount' => max($cashReceived - $total, 0),
                'payment_method' => $paymentMethod,
                'payment_status' => PaymentStatus::Paid,
            ])->save();

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);

                $transaction->details()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->selling_price,
                ]);

                $product->decrement('stock', $item['quantity']);
            }

            $transaction->loadMissing(['details.product:id,barcode,name', 'user:id,name']);

            return [$transaction, $receiptItems, $subtotal, $tax, $safeDiscount, $total];
        });

        return response()->json([
            'message' => "Transaction {$transaction->invoice_number} saved successfully.",
            'transaction' => $this->mapTransaction($transaction),
            'receipt' => $this->mapTransaction($transaction),
            'receipt_items' => $receiptItems,
            'totals' => [
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $safeDiscount,
                'total' => $total,
            ],
        ]);
    }

    private function mapProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'barcode' => $product->barcode,
            'name' => $product->name,
            'image_url' => $product->imageUrl(),
            'purchase_price' => (float) $product->purchase_price,
            'selling_price' => (float) $product->selling_price,
            'stock' => $product->stock,
            'min_stock' => $product->min_stock,
            'category' => $this->resolveCategory($product),
            'stock_status' => $product->stock <= $product->min_stock
                ? 'critical'
                : ($product->stock <= max($product->min_stock * 2, 5) ? 'warning' : 'good'),
        ];
    }

    private function mapTransaction(Transaction $transaction): array
    {
        $transaction->loadMissing(['details.product:id,barcode,name', 'user:id,name']);

        return [
            'id' => $transaction->id,
            'invoice_number' => $transaction->invoice_number,
            'payment_method' => $transaction->payment_method->value,
            'payment_status' => $transaction->payment_status->value,
            'subtotal' => (float) $transaction->subtotal_price,
            'tax' => (float) $transaction->tax_price,
            'discount' => (float) $transaction->discount_price,
            'total' => (float) $transaction->total_price,
            'cash_received' => $transaction->cash_received !== null ? (float) $transaction->cash_received : null,
            'change' => (float) $transaction->change_amount,
            'cashier_name' => $transaction->user?->name ?? '-',
            'created_at' => $transaction->created_at?->format('d M Y H:i'),
            'items' => $transaction->details->map(fn ($detail) => [
                'product_id' => $detail->product_id,
                'barcode' => $detail->product?->barcode,
                'name' => $detail->product?->name,
                'quantity' => $detail->quantity,
                'price' => (float) $detail->price,
                'subtotal' => (float) $detail->price * $detail->quantity,
            ])->values()->all(),
            'snap_token' => $transaction->midtrans_snap_token,
        ];
    }

    private function resolveCategory(Product $product): string
    {
        $name = strtolower($product->name);

        return match (true) {
            str_contains($name, 'water'),
            str_contains($name, 'juice'),
            str_contains($name, 'tea'),
            str_contains($name, 'coffee'),
            str_contains($name, 'milk'),
            str_contains($name, 'drink'),
            str_contains($name, 'soda') => 'Beverages',
            str_contains($name, 'snack'),
            str_contains($name, 'chips'),
            str_contains($name, 'cracker'),
            str_contains($name, 'biscuit'),
            str_contains($name, 'candy') => 'Snacks',
            str_contains($name, 'pen'),
            str_contains($name, 'book'),
            str_contains($name, 'paper'),
            str_contains($name, 'stationery') => 'Stationery',
            str_contains($name, 'soap'),
            str_contains($name, 'tissue'),
            str_contains($name, 'detergent'),
            str_contains($name, 'shampoo') => 'Essentials',
            default => 'General',
        };
    }
}
