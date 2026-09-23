<?php

namespace App\Services\Store;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        private readonly CartService $cart,
    ) {
    }

    public function checkout(Store $session, array $customer, ?int $userId = null): Transaction
    {
        $quantities = $this->cart->quantities($session);

        if ($quantities === []) {
            throw ValidationException::withMessages(['cart' => 'Keranjang belanja Anda masih kosong.']);
        }

        return DB::transaction(function () use ($quantities, $customer, $userId) {
            $products = Product::query()
                ->whereIn('id', array_keys($quantities))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $items = [];

            foreach ($quantities as $productId => $quantity) {
                $product = $products->get($productId);

                if (! $product) {
                    throw ValidationException::withMessages(['cart' => 'Salah satu produk di keranjang sudah tidak tersedia.']);
                }

                if (! $this->cart->isPublicProduct($product)) {
                    throw ValidationException::withMessages(['cart' => "{$product->name} tidak tersedia di toko online."]);
                }

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages(['cart' => "Stok {$product->name} tidak mencukupi."]);
                }

                $price = (float) $product->selling_price;
                $lineTotal = $price * $quantity;
                $subtotal += $lineTotal;
                $items[] = compact('product', 'quantity', 'price', 'lineTotal');
            }

            $tax = round($subtotal * 0.11, 2);
            $total = $subtotal + $tax;

            $transaction = Transaction::query()->create([
                'invoice_number' => $this->invoiceNumber(),
                'source' => 'store',
                'user_id' => $userId,
                'customer_name' => $customer['customer_name'],
                'customer_phone' => $customer['customer_phone'],
                'customer_address' => $customer['customer_address'],
                'subtotal_price' => $subtotal,
                'tax_price' => $tax,
                'discount_price' => 0,
                'total_price' => $total,
                'payment_method' => PaymentMethod::Cash,
                'payment_status' => PaymentStatus::Pending,
                'midtrans_snap_token' => null,
                'cash_received' => null,
                'change_amount' => 0,
            ]);

            foreach ($items as $item) {
                $transaction->details()->create([
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                $item['product']->decrement('stock', $item['quantity']);
            }

            return $transaction->load('details.product:id,barcode,name');
        });
    }

    private function invoiceNumber(): string
    {
        return sprintf('INV-STORE-%s-%s', now()->format('YmdHis'), Str::upper(Str::random(6)));
    }
}
