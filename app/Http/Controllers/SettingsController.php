<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingsRequest;
use App\Services\Settings\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(SettingsService $settings): Response
    {
        return Inertia::render('Settings/Index', [
            'settings' => $settings->formData(),
        ]);
    }

    public function update(UpdateSettingsRequest $request, SettingsService $settings)
    {
        $validated = $request->validated();

        $settings->update(
            [
                'app_name' => $validated['app_name'],
                'store_tagline' => $validated['store_tagline'] ?? '',
                'store_description' => $validated['store_description'] ?? '',
                'store_short_description' => $validated['store_short_description'] ?? '',
                'store_whatsapp' => $validated['store_whatsapp'] ?? '',
                'store_email' => $validated['store_email'] ?? '',
                'store_location' => $validated['store_location'] ?? '',
                'store_instagram' => $validated['store_instagram'] ?? '',
                'store_tiktok' => $validated['store_tiktok'] ?? '',
                'store_bank_name' => $validated['store_bank_name'] ?? '',
                'store_bank_number' => $validated['store_bank_number'] ?? '',
                'store_bank_holder' => $validated['store_bank_holder'] ?? '',
                'school_name' => $validated['school_name'] ?? '',
                'school_address' => $validated['school_address'] ?? '',
                'school_phone' => $validated['school_phone'] ?? '',
                'school_email' => $validated['school_email'] ?? '',
                'timezone' => $validated['timezone'] ?? 'Asia/Jakarta',
                'currency' => strtoupper($validated['currency'] ?? 'IDR'),
                'receipt_footer_text' => $validated['receipt_footer_text'] ?? '',
                'pos_auto_print_receipt' => (bool) ($validated['pos_auto_print_receipt'] ?? false),
                'pos_show_low_stock_warning' => (bool) ($validated['pos_show_low_stock_warning'] ?? false),
                'mail_from_name' => $validated['mail_from_name'] ?? '',
                'mail_from_address' => $validated['mail_from_address'] ?? '',
                'mail_reply_to' => $validated['mail_reply_to'] ?? '',
                'notifications_email' => $validated['notifications_email'] ?? '',
                'backup_enabled' => (bool) ($validated['backup_enabled'] ?? false),
                'backup_schedule' => $validated['backup_schedule'] ?? 'daily',
                'backup_retention_days' => (int) ($validated['backup_retention_days'] ?? 7),
                'permission_self_registration' => (bool) ($validated['permission_self_registration'] ?? false),
                'permission_cashier_refund' => (bool) ($validated['permission_cashier_refund'] ?? false),
                'appearance_theme' => $validated['appearance_theme'],
                'system_maintenance_enabled' => (bool) ($validated['system_maintenance_enabled'] ?? false),
            ],
            [
                'app_logo_path' => $request->file('app_logo'),
                'favicon_path' => $request->file('favicon'),
            ],
            $request->user(),
        );

        if (! $request->file('app_logo') && (bool) ($validated['remove_app_logo'] ?? false)) {
            $settings->removeFile('app_logo_path', $request->user());
        }

        return redirect()->route('admin.settings')->with('success', 'Settings updated successfully.');
    }
}
