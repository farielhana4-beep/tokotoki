<?php

use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:kasir,super_admin'])
    ->prefix('admin/transactions')
    ->name('admin.transactions.')
    ->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
    });
