<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class DefaultSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'app_name' => config('app.name', 'TOKOTOKI'),
            'store_tagline' => 'Kerajinan kecil, dekorasi yang berarti.',
            'store_description' => 'TOKOTOKI adalah toko kerajinan dan dekorasi yang menyediakan berbagai produk untuk melengkapi kebutuhan dekorasi, aksesoris, perlengkapan rumah, dan souvenir.',
            'store_short_description' => 'Toko Kerajinan & Dekorasi',
            'store_whatsapp' => '',
            'store_email' => '',
            'store_location' => '',
            'store_instagram' => '',
            'store_tiktok' => '',
            'store_bank_name' => '',
            'store_bank_number' => '',
            'store_bank_holder' => '',
            'school_name' => 'TOKOTOKI',
            'school_address' => '',
            'school_phone' => '',
            'school_email' => '',
            'timezone' => 'Asia/Jakarta',
            'currency' => 'IDR',
            'receipt_footer_text' => 'Terima kasih telah berbelanja di TOKOTOKI.',
            'pos_auto_print_receipt' => '1',
            'pos_show_low_stock_warning' => '1',
            'mail_from_name' => 'TOKOTOKI',
            'mail_from_address' => 'noreply@koperasi.test',
            'mail_reply_to' => 'support@koperasi.test',
            'notifications_email' => 'admin@koperasi.test',
            'backup_enabled' => '1',
            'backup_schedule' => 'daily',
            'backup_retention_days' => '14',
            'permission_self_registration' => '0',
            'permission_cashier_refund' => '0',
            'appearance_theme' => 'dark',
            'system_maintenance_enabled' => '0',
        ];

        $groupMap = [
            'branding' => [
                'app_name',
                'store_tagline',
                'store_description',
                'store_short_description',
                'store_whatsapp',
                'store_email',
                'store_location',
                'store_instagram',
                'store_tiktok',
                'store_bank_name',
                'store_bank_number',
                'store_bank_holder',
                'school_name',
                'school_address',
                'school_phone',
                'school_email',
                'timezone',
                'currency',
            ],
            'pos' => [
                'receipt_footer_text',
                'pos_auto_print_receipt',
                'pos_show_low_stock_warning',
            ],
            'mail' => [
                'mail_from_name',
                'mail_from_address',
                'mail_reply_to',
                'notifications_email',
            ],
            'backup' => [
                'backup_enabled',
                'backup_schedule',
                'backup_retention_days',
            ],
            'permissions' => [
                'permission_self_registration',
                'permission_cashier_refund',
            ],
            'appearance' => [
                'appearance_theme',
            ],
            'system' => [
                'system_maintenance_enabled',
            ],
        ];

        $booleanKeys = [
            'pos_auto_print_receipt',
            'pos_show_low_stock_warning',
            'backup_enabled',
            'permission_self_registration',
            'permission_cashier_refund',
            'system_maintenance_enabled',
        ];

        foreach ($defaults as $key => $value) {
            $group = 'general';

            foreach ($groupMap as $groupName => $keys) {
                if (in_array($key, $keys, true)) {
                    $group = $groupName;
                    break;
                }
            }

            $type = in_array($key, $booleanKeys, true)
                ? 'boolean'
                : ($key === 'backup_retention_days'
                    ? 'integer'
                    : ($key === 'receipt_footer_text' || $key === 'school_address' ? 'text' : 'string'));

            Setting::query()->updateOrCreate(
                ['key' => $key],
                [
                    'group' => $group,
                    'type' => $type,
                    'value' => $value,
                ],
            );
        }

        Cache::forget('koperasi_pos.settings');
    }
}
