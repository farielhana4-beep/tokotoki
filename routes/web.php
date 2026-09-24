<?php

use App\Http\Controllers\PublicStoreController;
use App\Http\Controllers\CustomerAccountController;
use App\Http\Controllers\StoreCartController;
use App\Http\Controllers\StoreCheckoutController;
use App\Http\Controllers\ProfileController;
use App\Enums\ReportPeriod;
use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public storefront. Admin and POS routes remain in their existing modules.
Route::get('/', [PublicStoreController::class, 'home'])->name('store.home');
Route::get('/catalog', [PublicStoreController::class, 'index'])->name('store.catalog');
Route::get('/catalog/{product}', [PublicStoreController::class, 'show'])->name('store.products.show');
Route::get('/cart', [StoreCartController::class, 'index'])->name('store.cart.index');
Route::post('/cart/items/{product}', [StoreCartController::class, 'store'])->name('store.cart.store');
Route::patch('/cart/items/{product}', [StoreCartController::class, 'update'])->name('store.cart.update');
Route::delete('/cart/items/{productId}', [StoreCartController::class, 'destroy'])->whereNumber('productId')->name('store.cart.destroy');
Route::get('/checkout', [StoreCheckoutController::class, 'create'])->name('store.checkout.create');
Route::post('/checkout', [StoreCheckoutController::class, 'store'])->name('store.checkout.store');
Route::get('/checkout/success/{transaction}', [StoreCheckoutController::class, 'success'])->name('store.checkout.success');

// Customer account (login required, any role; data is scoped to the owner).
Route::middleware('auth')->group(function () {
    Route::get('/akun', [CustomerAccountController::class, 'account'])->name('store.account');
    Route::get('/pesanan', [CustomerAccountController::class, 'orders'])->name('store.orders.index');
    Route::get('/pesanan/{transaction}/struk', [CustomerAccountController::class, 'storeReceipt'])->name('store.orders.receipt');
    Route::get('/pesanan/{transaction}', [CustomerAccountController::class, 'showOrder'])->name('store.orders.show');
});

Route::get('/admin/dashboard', function () {
    $report = app(\App\Services\Report\ReportService::class)->buildReport(ReportPeriod::Weekly);

    return Inertia::render('Dashboard', [
        'report' => $report,
        'metrics' => [
            'today_revenue' => Transaction::query()
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->whereDate('created_at', today())
                ->where('payment_status', PaymentStatus::Paid->value)
                ->sum('total_price'),
            'today_transactions' => Transaction::query()
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->whereDate('created_at', today())
                ->where('payment_status', PaymentStatus::Paid->value)
                ->count(),
            'low_stock_products' => Product::query()->whereColumn('stock', '<=', 'min_stock')->count(),
        ],
        'recentTransactions' => Transaction::query()
            ->with('user:id,name')
            ->where('invoice_number', 'not like', 'INV-DEMO-%')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Transaction $transaction) => [
                'invoice_number' => $transaction->invoice_number,
                'cashier_name' => $transaction->user?->name,
                'payment_status' => $transaction->payment_status->value,
                'payment_method' => $transaction->payment_method->value,
                'total_price' => (float) $transaction->total_price,
                'created_at' => $transaction->created_at?->format('d M H:i'),
            ]),
    ]);
})->middleware(['auth', 'verified', 'role:super_admin'])->name('admin.dashboard');

Route::get('/maintenance', function () {
    return Inertia::render('Maintenance', [
        'branding' => app(\App\Services\Settings\SettingsService::class)->frontend()['branding'],
    ]);
})->name('maintenance');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/modules/transactions.php';
require __DIR__.'/modules/products.php';
require __DIR__.'/modules/pos.php';
require __DIR__.'/modules/reports.php';
require __DIR__.'/modules/users.php';
require __DIR__.'/modules/settings.php';
