<?php

namespace Tests\Feature\Store;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function product(array $overrides = []): Product
    {
        return Product::query()->create(array_merge([
            'barcode' => '899000000'.str_pad((string) (Product::query()->count() + 1), 4, '0', STR_PAD_LEFT),
            'name' => 'Produk Uji', 'category' => 'Dekorasi',
            'purchase_price' => 5000, 'selling_price' => 10000,
            'stock' => 10, 'min_stock' => 1, 'status' => 'active',
        ], $overrides));
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Siti Pembeli',
            'customer_phone' => '081234567890',
            'customer_address' => 'Catatan pengambilan',
            'payment_method' => 'transfer',
        ], $overrides);
    }

    public function test_transfer_checkout_records_pending_transfer_transaction(): void
    {
        $product = $this->product();
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)
            ->withSession(['store.cart' => [$product->id => 2], 'store.cart_checkout_token' => 'transfer-tok'])
            ->post(route('store.checkout.store'), $this->payload())
            ->assertRedirect();

        $transaction = Transaction::query()->firstOrFail();
        $this->assertSame(PaymentMethod::Transfer, $transaction->payment_method);
        $this->assertSame(PaymentStatus::Pending, $transaction->payment_status);
        $this->assertSame($customer->id, $transaction->user_id);
        $this->assertSame('20000.00', (string) $transaction->subtotal_price);
    }

    public function test_invalid_payment_method_is_rejected(): void
    {
        $product = $this->product();

        $this->withSession(['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'bad-tok'])
            ->post(route('store.checkout.store'), $this->payload(['payment_method' => 'qris']))
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_admin_can_confirm_transfer_as_paid_and_it_enters_revenue(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $product = $this->product();
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)
            ->withSession(['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'confirm-tok'])
            ->post(route('store.checkout.store'), $this->payload())
            ->assertRedirect();

        $transaction = Transaction::query()->firstOrFail();

        // Pending transfer is excluded from revenue.
        $before = $this->actingAs($admin)->get(route('admin.transactions.index'));
        $this->assertSame(0.0, (float) $before->viewData('page')['props']['summary']['revenue']);

        $this->actingAs($admin)
            ->patch(route('admin.transactions.status', $transaction), ['payment_status' => 'paid'])
            ->assertRedirect();

        $this->assertSame(PaymentStatus::Paid, $transaction->fresh()->payment_status);

        $after = $this->actingAs($admin)->get(route('admin.transactions.index'));
        $this->assertSame((float) $transaction->fresh()->total_price, (float) $after->viewData('page')['props']['summary']['revenue']);
    }

    public function test_kasir_can_confirm_transfer_as_paid(): void
    {
        $kasir = User::factory()->create();
        $transaction = Transaction::query()->create([
            'invoice_number' => 'INV-TRANSFER-1', 'source' => 'store', 'user_id' => null,
            'customer_name' => 'Siti', 'customer_phone' => '081234567890', 'customer_address' => 'Alamat',
            'subtotal_price' => 10000, 'tax_price' => 1100, 'discount_price' => 0, 'total_price' => 11100,
            'payment_method' => 'transfer', 'payment_status' => 'pending',
        ]);

        $this->actingAs($kasir)
            ->patch(route('admin.transactions.status', $transaction), ['payment_status' => 'paid'])
            ->assertRedirect();

        $this->assertSame(PaymentStatus::Paid, $transaction->fresh()->payment_status);
    }

    public function test_customer_cannot_confirm_own_transaction(): void
    {
        $customer = User::factory()->customer()->create();
        $transaction = Transaction::query()->create([
            'invoice_number' => 'INV-TRANSFER-2', 'source' => 'store', 'user_id' => $customer->id,
            'customer_name' => 'Siti', 'customer_phone' => '081234567890', 'customer_address' => 'Alamat',
            'subtotal_price' => 10000, 'tax_price' => 1100, 'discount_price' => 0, 'total_price' => 11100,
            'payment_method' => 'transfer', 'payment_status' => 'pending',
        ]);

        $this->actingAs($customer)
            ->patch(route('admin.transactions.status', $transaction), ['payment_status' => 'paid'])
            ->assertRedirect(route('store.home'));

        $this->assertSame(PaymentStatus::Pending, $transaction->fresh()->payment_status);
    }

    public function test_invalid_status_value_is_rejected(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $transaction = Transaction::query()->create([
            'invoice_number' => 'INV-TRANSFER-3', 'source' => 'pos', 'user_id' => $admin->id,
            'subtotal_price' => 10000, 'tax_price' => 1100, 'discount_price' => 0, 'total_price' => 11100,
            'payment_method' => 'cash', 'payment_status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.transactions.status', $transaction), ['payment_status' => 'canceled'])
            ->assertSessionHasErrors('payment_status');

        $this->assertSame(PaymentStatus::Pending, $transaction->fresh()->payment_status);
    }

    public function test_detail_add_with_chosen_quantity_merges_without_duplicates(): void
    {
        $product = $this->product(['stock' => 5]);

        // Simulates ProductDetail submitting quantity 2, then 2 again.
        $this->post(route('store.cart.store', $product), ['quantity' => 2])->assertRedirect();
        $this->withSession(['store.cart' => [$product->id => 2]])
            ->post(route('store.cart.store', $product), ['quantity' => 2])
            ->assertRedirect();

        $this->assertSame([$product->id => 4], session('store.cart'));

        // Beyond stock is refused with clear feedback.
        $this->withSession(['store.cart' => [$product->id => 4]])
            ->post(route('store.cart.store', $product), ['quantity' => 2])
            ->assertSessionHasErrors('quantity');
        $this->assertSame([$product->id => 4], session('store.cart'));
    }

    public function test_bank_settings_are_shared_to_storefront(): void
    {
        \App\Models\Setting::query()->updateOrCreate(['key' => 'store_bank_name'], ['group' => 'branding', 'type' => 'string', 'value' => 'BCA']);
        \App\Models\Setting::query()->updateOrCreate(['key' => 'store_bank_number'], ['group' => 'branding', 'type' => 'string', 'value' => '1234567890']);
        \App\Models\Setting::query()->updateOrCreate(['key' => 'store_bank_holder'], ['group' => 'branding', 'type' => 'string', 'value' => 'TOKOTOKI']);
        \Illuminate\Support\Facades\Cache::forget('koperasi_pos.settings');

        $this->get(route('store.catalog'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('settings.branding.store_bank_name', 'BCA')
                ->where('settings.branding.store_bank_number', '1234567890')
                ->where('settings.branding.store_bank_holder', 'TOKOTOKI'));
    }
}
