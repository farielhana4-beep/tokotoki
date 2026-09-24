<?php

use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionReceiptController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:kasir,super_admin'])
    ->prefix('admin/transactions')
    ->name('admin.transactions.')
    ->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::get('/{transaction}/receipt', [TransactionReceiptController::class, 'admin'])->name('receipt');
        Route::patch('/{transaction}/status', [TransactionController::class, 'updateStatus'])->name('status');
    });
