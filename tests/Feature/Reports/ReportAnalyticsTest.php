<?php

namespace Tests\Feature\Reports;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_reports_dashboard_shows_analytics_data(): void
    {
        Carbon::setTestNow('2026-05-26 12:00:00');

        $superAdmin = User::factory()->superAdmin()->create();
        $cashier = User::factory()->create([
            'name' => 'Andi Kasir',
        ]);

        $water = Product::query()->create([
            'barcode' => '1111111111111',
            'name' => 'Mineral Water',
            'purchase_price' => 3000,
            'selling_price' => 5000,
            'stock' => 20,
            'min_stock' => 5,
        ]);

        $pen = Product::query()->create([
            'barcode' => '2222222222222',
            'name' => 'Blue Pen',
            'purchase_price' => 1000,
            'selling_price' => 2000,
            'stock' => 15,
            'min_stock' => 5,
        ]);

        $lowStock = Product::query()->create([
            'barcode' => '3333333333333',
            'name' => 'Notebook',
            'purchase_price' => 4000,
            'selling_price' => 6000,
            'stock' => 2,
            'min_stock' => 5,
        ]);

        $this->createTransaction($cashier, PaymentMethod::Cash, PaymentStatus::Paid, '2026-05-25 10:00:00', [
            ['product' => $water, 'quantity' => 2, 'price' => 5000],
        ]);

        $this->createTransaction($cashier, PaymentMethod::Qris, PaymentStatus::Paid, '2026-05-26 09:00:00', [
            ['product' => $pen, 'quantity' => 3, 'price' => 2000],
        ]);

        $this->createTransaction($cashier, PaymentMethod::Cash, PaymentStatus::Pending, '2026-05-26 11:00:00', [
            ['product' => $lowStock, 'quantity' => 1, 'price' => 6000],
        ]);

        $this->actingAs($superAdmin)
            ->get(route('admin.reports.index', ['period' => 'monthly']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reports/Index')
                ->where('selectedPeriod', 'monthly')
                ->has('report.summary', 4)
                ->where('report.summary.0.value', 16000)
                ->has('report.timeline')
                ->has('report.payment_methods', 2)
                ->has('report.top_products', 2)
                ->has('report.low_stock_alerts', 1)
                ->has('report.cashier_performance', 1)
                ->has('exports.pdf')
                ->has('exports.excel')
            );

        Carbon::setTestNow();
    }

    public function test_reports_pdf_export_downloads_a_pdf_file(): void
    {
        Carbon::setTestNow('2026-05-26 12:00:00');

        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get(route('admin.reports.export.pdf', ['period' => 'monthly']))
            ->assertOk()
            ->assertDownload();

        Carbon::setTestNow();
    }

    public function test_reports_excel_export_downloads_an_xlsx_file(): void
    {
        Carbon::setTestNow('2026-05-26 12:00:00');

        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get(route('admin.reports.export.excel', ['period' => 'monthly']))
            ->assertOk()
            ->assertDownload();

        Carbon::setTestNow();
    }

    private function createTransaction(User $user, PaymentMethod $method, PaymentStatus $status, string $dateTime, array $items): Transaction
    {
        $timestamp = Carbon::parse($dateTime);

        $transaction = Transaction::query()->create([
            'invoice_number' => 'INV-'.str_replace(['-', ' ', ':'], '', $dateTime),
            'user_id' => $user->id,
            'total_price' => collect($items)->sum(fn ($item) => $item['quantity'] * $item['price']),
            'payment_method' => $method,
            'payment_status' => $status,
        ]);

        $transaction->forceFill([
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ])->save();

        foreach ($items as $item) {
            $transaction->details()->create([
                'product_id' => $item['product']->id,
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        return $transaction;
    }
}
