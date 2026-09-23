<?php

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:super_admin'])
    ->prefix('admin/settings')
    ->name('admin.settings')
    ->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::post('/', [SettingsController::class, 'update'])->name('.update');
    });
