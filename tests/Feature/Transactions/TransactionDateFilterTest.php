<?php

namespace Tests\Feature\Transactions;

use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionDateFilterTest extends TestCase
{
    use RefreshDatabase;

    private function transaction(string $invoice, string $dateTime, string $status = 'paid', int $total = 10000): Transaction
    {
        $product = Product::query()->create([
            'barcode' => '899'.str_pad((string) (Product::query()->count() + 1), 10, '0', STR_PAD_LEFT),
            'name' => 'Produk Uji', 'category' => 'Dekorasi',
            'purchase_price' => 5000, 'selling_price' => 10000,
            'stock' => 50, 'min_stock' => 1, 'status' => 'active',
        ]);

        $transaction = Transaction::query()->create([
            'invoice_number' => $invoice, 'source' => 'pos', 'user_id' => null,
            'subtotal_price' => $total, 'tax_price' => 0, 'discount_price' => 0, 'total_price' => $total,
            'payment_method' => 'cash', 'payment_status' => $status,
        ]);
        $transaction->details()->create(['product_id' => $product->id, 'quantity' => 1, 'price' => $total]);
        $transaction->forceFill([
            'created_at' => Carbon::parse($dateTime),
            'updated_at' => Carbon::parse($dateTime),
        ])->save();

        return $transaction->fresh();
    }

    public function test_date_range_is_inclusive_of_end_day_hours(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $this->transaction('INV-F-001', '2026-09-10 00:00:01');
        $this->transaction('INV-F-002', '2026-09-20 23:59:59');
        $this->transaction('INV-F-003', '2026-09-30 12:00:00');
        $this->transaction('INV-F-004', '2026-10-01 00:00:00');

        $response = $this->actingAs($admin)->get(route('admin.transactions.index', [
            'date_from' => '2026-09-10',
            'date_to' => '2026-09-30',
        ]))->assertOk();

        $invoices = collect($response->viewData('page')['props']['transactions']['data'])
            ->pluck('invoice_number')->all();

        $this->assertEqualsCanonicalizing(['INV-F-001', 'INV-F-002', 'INV-F-003'], $invoices);
    }

    public function test_summary_follows_filters_and_revenue_is_paid_only(): void
    {
        $admin = User::factory()->superAdmin()->create();
        $this->transaction('INV-S-001', '2026-09-05 10:00:00', 'paid', 10000);
        $this->transaction('INV-S-002', '2026-09-06 10:00:00', 'pending', 50000);
        $this->transaction('INV-S-003', '2026-08-01 10:00:00', 'paid', 70000);

        $response = $this->actingAs($admin)->get(route('admin.transactions.index', [
            'date_from' => '2026-09-01',
            'date_to' => '2026-09-30',
        ]))->assertOk();

        $summary = $response->viewData('page')['props']['summary'];

        $this->assertSame(2, $summary['total']);
        $this->assertSame(1, $summary['paid']);
        $this->assertSame(1, $summary['pending']);
        // Pending 50000 excluded; August paid 70000 outside range.
        $this->assertSame(10000.0, (float) $summary['revenue']);
    }
}
