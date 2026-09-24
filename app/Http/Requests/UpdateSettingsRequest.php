<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'app_name' => ['required', 'string', 'max:120'],
            'store_tagline' => ['nullable', 'string', 'max:120'],
            'store_description' => ['nullable', 'string', 'max:500'],
            'store_short_description' => ['nullable', 'string', 'max:120'],
            'store_whatsapp' => ['nullable', 'string', 'max:30', 'regex:/^[+0-9][0-9\s\-.()]{6,25}$/'],
            'store_email' => ['nullable', 'email', 'max:120'],
            'store_location' => ['nullable', 'string', 'max:255'],
            'store_instagram' => ['nullable', 'url', 'max:255'],
            'store_tiktok' => ['nullable', 'url', 'max:255'],
            'store_bank_name' => ['nullable', 'string', 'max:60'],
            'store_bank_number' => ['nullable', 'string', 'max:40', 'regex:/^[0-9][0-9\s\-.]{5,39}$/'],
            'store_bank_holder' => ['nullable', 'string', 'max:120'],
            'school_name' => ['nullable', 'string', 'max:150'],
            'school_address' => ['nullable', 'string', 'max:255'],
            'school_phone' => ['nullable', 'string', 'max:30'],
            'school_email' => ['nullable', 'email', 'max:120'],
            'timezone' => ['nullable', 'string', 'max:80'],
            'currency' => ['nullable', 'string', 'size:3'],
            'receipt_footer_text' => ['nullable', 'string', 'max:255'],
            'pos_auto_print_receipt' => ['nullable', 'boolean'],
            'pos_show_low_stock_warning' => ['nullable', 'boolean'],
            'mail_from_name' => ['nullable', 'string', 'max:120'],
            'mail_from_address' => ['nullable', 'email', 'max:120'],
            'mail_reply_to' => ['nullable', 'email', 'max:120'],
            'notifications_email' => ['nullable', 'email', 'max:120'],
            'backup_enabled' => ['nullable', 'boolean'],
            'backup_schedule' => ['nullable', 'string', 'max:120'],
            'backup_retention_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'permission_self_registration' => ['nullable', 'boolean'],
            'permission_cashier_refund' => ['nullable', 'boolean'],
            'appearance_theme' => ['required', 'in:dark,light'],
            'system_maintenance_enabled' => ['nullable', 'boolean'],
            'app_logo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
            'remove_app_logo' => ['nullable', 'boolean'],
            'favicon' => ['nullable', 'file', 'mimes:ico,png,svg,jpg,jpeg,webp', 'max:1024'],
        ];
    }
}
