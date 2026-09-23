<?php

namespace Tests\Feature\Store;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_open_checkout_with_a_valid_cart(): void
    {
        $product = $this->product();

        $this->withSession(['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'checkout-token'])
            ->get(route('store.checkout.create'))
            ->assertOk();
    }

    public function test_empty_cart_is_redirected_to_cart(): void
    {
        $this->get(route('store.checkout.create'))
            ->assertRedirect(route('store.cart.index'));
    }

    public function test_guest_checkout_creates_a_pending_store_transaction_and_clears_cart(): void
    {
        $product = $this->product(['selling_price' => 12500, 'stock' => 5]);
        $session = ['store.cart' => [$product->id => 2], 'store.cart_checkout_token' => 'checkout-token'];

        $response = $this->withSession($session)->post(route('store.checkout.store'), $this->customerPayload([
            'price' => 1,
            'subtotal' => 1,
            'total' => 1,
        ]));

        $transaction = Transaction::query()->firstOrFail();

        $response->assertRedirect(route('store.checkout.success', $transaction));
        $this->assertNull($transaction->user_id);
        $this->assertSame('store', $transaction->source);
        $this->assertSame(PaymentMethod::Cash, $transaction->payment_method);
        $this->assertSame(PaymentStatus::Pending, $transaction->payment_status);
        $this->assertSame('Siti Pembeli', $transaction->customer_name);
        $this->assertSame('081234567890', $transaction->customer_phone);
        $this->assertSame('Catatan pengambilan di koperasi', $transaction->customer_address);
        $this->assertSame('25000.00', (string) $transaction->subtotal_price);
        $this->assertSame('2750.00', (string) $transaction->tax_price);
        $this->assertSame('27750.00', (string) $transaction->total_price);
        $this->assertDatabaseHas('transaction_details', [
            'transaction_id' => $transaction->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 12500,
        ]);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 3]);
        $this->assertSame([], session('store.cart', []));
    }

    public function test_checkout_uses_database_prices_and_rejects_insufficient_stock_without_side_effects(): void
    {
        $product = $this->product(['selling_price' => 8000, 'stock' => 1]);

        $this->withSession(['store.cart' => [$product->id => 2], 'store.cart_checkout_token' => 'insufficient-stock-token'])
            ->post(route('store.checkout.store'), $this->customerPayload())
            ->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 1]);
    }

    public function test_same_cart_token_cannot_create_a_second_transaction(): void
    {
        $product = $this->product(['stock' => 5]);
        $session = ['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'duplicate-checkout-token'];

        $this->withSession($session)->post(route('store.checkout.store'), $this->customerPayload())
            ->assertRedirect();
        $this->withSession($session)->post(route('store.checkout.store'), $this->customerPayload())
            ->assertSessionHas('error');

        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 4]);
    }

    private function product(array $overrides = []): Product
    {
        return Product::query()->create(array_merge([
            'barcode' => '8990000000001',
            'name' => 'Produk Uji',
            'category' => 'Dekorasi',
            'purchase_price' => 5000,
            'selling_price' => 10000,
            'stock' => 10,
            'min_stock' => 1,
            'status' => 'active',
        ], $overrides));
    }

    private function customerPayload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Siti Pembeli',
            'customer_phone' => '081234567890',
            'customer_address' => 'Catatan pengambilan di koperasi',
            'payment_method' => 'cash',
        ], $overrides);
    }
}
