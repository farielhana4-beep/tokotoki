<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\PosCheckoutRequest;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Services\POS\TransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product) => $this->mapProduct($product))
            ->values();

        $categories = $products
            ->pluck('category')
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('POS/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => '',
                'category' => 'all',
            ],
            'summary' => [
                'total_products' => $products->count(),
                'low_stock_products' => $products->where('stock_status', 'critical')->count(),
                'categories_count' => $categories->count(),
            ],
            'recentTransactions' => Transaction::query()
                ->with([
                    'user:id,name',
                    'details.product:id,barcode,name',
                ])
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->whereIn('payment_status', [PaymentStatus::Paid->value, PaymentStatus::Pending->value])
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (Transaction $transaction) => $this->mapTransactionSummary($transaction))
                ->values(),
        ]);
    }

    public function checkout(PosCheckoutRequest $request, TransactionService $transactionService): RedirectResponse
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

        $transaction = DB::transaction(function () use (
            $validated,
            $paymentMethod,
            $cashReceived,
            $discount,
            $products,
            $transactionService,
            $user
        ) {
            $items = $this->normalizeItems($validated['items']);
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

            $transaction->setRelation('details', $transaction->details()->with('product:id,barcode,name')->get());

            return [$transaction, $receiptItems, $subtotal, $tax, $safeDiscount, $total];
        });

        [$transaction, $receiptItems, $subtotal, $tax, $safeDiscount, $total] = $transaction;

        return redirect()
            ->route('pos.index')
            ->with('success', "Transaction {$transaction->invoice_number} saved successfully.")
            ->with('receipt', $this->buildReceiptPayload($transaction, $receiptItems, $user?->name));
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

    private function normalizeItems(array $items): array
    {
        return collect($items)
            ->groupBy('product_id')
            ->map(fn ($group) => [
                'product_id' => (int) $group->first()['product_id'],
                'quantity' => (int) $group->sum('quantity'),
            ])
            ->values()
            ->all();
    }

    private function buildReceiptPayload(Transaction $transaction, ?array $receiptItems = null, ?string $cashierName = null): array
    {
        $transaction->loadMissing(['details.product:id,barcode,name', 'user:id,name']);
        $items = $receiptItems ?? $transaction->details->map(fn (TransactionDetail $detail) => [
            'product_id' => $detail->product_id,
            'name' => $detail->product?->name,
            'barcode' => $detail->product?->barcode,
            'quantity' => $detail->quantity,
            'price' => (float) $detail->price,
            'subtotal' => (float) $detail->price * $detail->quantity,
        ])->values()->all();

        return [
            'invoice_number' => $transaction->invoice_number,
            'payment_method' => $transaction->payment_method->value,
            'payment_status' => $transaction->payment_status->value,
            'subtotal' => (float) $transaction->subtotal_price,
            'tax' => (float) $transaction->tax_price,
            'discount' => (float) $transaction->discount_price,
            'total' => (float) $transaction->total_price,
            'cash_received' => $transaction->cash_received !== null ? (float) $transaction->cash_received : null,
            'change' => (float) $transaction->change_amount,
            'items' => $items,
            'created_at' => $transaction->created_at?->format('d M Y H:i') ?? now()->format('d M Y H:i'),
            'cashier_name' => $cashierName ?? $transaction->user?->name ?? '-',
            'snap_token' => $transaction->midtrans_snap_token,
            'id' => $transaction->id,
        ];
    }

    private function mapTransactionSummary(Transaction $transaction): array
    {
        $receipt = $this->buildReceiptPayload($transaction);

        return [
            'id' => $receipt['id'],
            'invoice_number' => $receipt['invoice_number'],
            'cashier_name' => $receipt['cashier_name'],
            'payment_method' => $receipt['payment_method'],
            'payment_status' => $receipt['payment_status'],
            'subtotal' => $receipt['subtotal'],
            'tax' => $receipt['tax'],
            'discount' => $receipt['discount'],
            'total_price' => $receipt['total'],
            'cash_received' => $receipt['cash_received'],
            'change' => $receipt['change'],
            'created_at' => $receipt['created_at'],
            'items' => $receipt['items'],
            'snap_token' => $receipt['snap_token'],
        ];
    }
}
