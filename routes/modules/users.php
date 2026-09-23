<?php

use App\Http\Controllers\AdminUserPasswordResetController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:super_admin'])
    ->prefix('admin/users')
    ->name('admin.users.')
    ->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/{user}/password-reset', [AdminUserPasswordResetController::class, 'store'])
            ->name('password-reset');
    });
