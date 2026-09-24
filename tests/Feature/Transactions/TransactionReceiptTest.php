<?php

namespace Tests\Feature\Transactions;

use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionReceiptTest extends TestCase
{
    use RefreshDatabase;

    private function product(): Product
    {
        return Product::query()->create([
            'barcode' => '8990000000001', 'name' => 'Produk Uji', 'category' => 'Dekorasi',
            'purchase_price' => 5000, 'selling_price' => 10000,
            'stock' => 10, 'min_stock' => 1, 'status' => 'active',
        ]);
    }

    private function transaction(array $overrides = []): Transaction
    {
        $product = $this->product();
        $transaction = Transaction::query()->create(array_merge([
            'invoice_number' => 'INV-TEST-'.uniqid(),
            'source' => 'pos', 'user_id' => null,
            'customer_name' => null, 'customer_phone' => null, 'customer_address' => null,
            'subtotal_price' => 20000, 'tax_price' => 2200, 'discount_price' => 0, 'total_price' => 22200,
            'payment_method' => 'cash', 'payment_status' => 'paid',
        ], $overrides));
        $transaction->details()->create(['product_id' => $product->id, 'quantity' => 2, 'price' => 10000]);

        return $transaction;
    }

    public function test_admin_can_download_receipt_pdf(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $transaction = $this->transaction(['invoice_number' => 'INV-TEST-001']);

        $response = $this->actingAs($admin)->get(route('admin.transactions.receipt', $transaction));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $content = $response->streamedContent();
        $this->assertStringStartsWith('%PDF', $content);
        $this->assertGreaterThan(1000, strlen($content));
    }

    public function test_kasir_can_download_receipt_pdf(): void
    {
        $kasir = User::factory()->create();
        $transaction = $this->transaction(['invoice_number' => 'INV-TEST-002']);

        $this->actingAs($kasir)
            ->get(route('admin.transactions.receipt', $transaction))
            ->assertOk();
    }

    public function test_customer_can_download_own_order_receipt(): void
    {
        $customer = User::factory()->customer()->create();
        $transaction = $this->transaction([
            'invoice_number' => 'INV-TEST-003', 'source' => 'store', 'user_id' => $customer->id,
            'customer_name' => 'Siti', 'customer_phone' => '081234567890', 'customer_address' => 'Alamat',
        ]);

        $response = $this->actingAs($customer)->get(route('store.orders.receipt', $transaction));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $content = $response->streamedContent();
        $this->assertStringStartsWith('%PDF', $content);
        $this->assertGreaterThan(1000, strlen($content));
    }

    public function test_customer_cannot_download_other_customer_receipt(): void
    {
        $owner = User::factory()->customer()->create();
        $intruder = User::factory()->customer()->create();
        $transaction = $this->transaction([
            'invoice_number' => 'INV-TEST-004', 'source' => 'store', 'user_id' => $owner->id,
        ]);

        $this->actingAs($intruder)->get(route('store.orders.receipt', $transaction))->assertNotFound();
    }

    public function test_guest_cannot_download_receipts(): void
    {
        $transaction = $this->transaction(['invoice_number' => 'INV-TEST-005']);

        $this->get(route('admin.transactions.receipt', $transaction))->assertRedirect(route('login'));
        $this->get(route('store.orders.receipt', $transaction))->assertRedirect(route('login'));
    }

    public function test_receipt_payload_uses_trusted_database_values(): void
    {
        $customer = User::factory()->customer()->create();
        $transaction = $this->transaction([
            'invoice_number' => 'INV-TEST-007', 'source' => 'store', 'user_id' => $customer->id,
            'customer_name' => 'Siti', 'customer_phone' => '081234567890', 'customer_address' => 'Alamat',
        ]);

        $payload = app(\App\Services\Report\TransactionReceiptService::class)->payload($transaction);

        $this->assertSame('INV-TEST-007', $payload['invoice_number']);
        $this->assertSame('Siti', $payload['customer_name']);
        $this->assertSame(22200.0, $payload['total']);
        $this->assertCount(1, $payload['items']);
        $this->assertSame('Produk Uji', $payload['items'][0]['name']);
        $this->assertSame(20000.0, $payload['items'][0]['subtotal']);
        $this->assertSame('TOKOTOKI', $payload['store_name']);
    }

    public function test_guest_null_customer_receipt_is_safe(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $transaction = $this->transaction(['invoice_number' => 'INV-TEST-006']);

        $this->actingAs($admin)
            ->get(route('admin.transactions.receipt', $transaction))
            ->assertOk();
    }
}
