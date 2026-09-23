<?php

namespace App\Services\Settings;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class SettingsService
{
    private const CACHE_KEY = 'koperasi_pos.settings';

    /**
     * Keys that should not be overwritten when the incoming value is empty.
     */
    private const PRESERVE_WHEN_EMPTY = [
    ];

    public function all(): array
    {
        if (! Schema::hasTable('settings')) {
            return [];
        }

        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            return Setting::query()
                ->get()
                ->mapWithKeys(fn (Setting $setting) => [
                    $setting->key => $this->castValue($setting->value, $setting->type),
                ])
                ->all();
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    public function boolean(string $key, bool $default = false): bool
    {
        return filter_var($this->get($key, $default), FILTER_VALIDATE_BOOLEAN);
    }

    public function imageUrl(string $key, string $fallback): string
    {
        $path = $this->get($key);

        if (blank($path)) {
            return $fallback;
        }

        return Storage::disk('public')->url($path);
    }

    public function frontend(): array
    {
        return [
            'branding' => [
                'app_name' => $this->get('app_name', config('app.name', 'TOKOTOKI')),
                'store_tagline' => $this->get('store_tagline', 'Kerajinan kecil, dekorasi yang berarti.'),
                'store_description' => $this->get('store_description', 'TOKOTOKI adalah toko kerajinan dan dekorasi yang menyediakan berbagai produk untuk melengkapi kebutuhan dekorasi, aksesoris, perlengkapan rumah, dan souvenir.'),
                'store_short_description' => $this->get('store_short_description', 'Toko Kerajinan & Dekorasi'),
                'store_whatsapp' => $this->get('store_whatsapp', ''),
                'store_email' => $this->get('store_email', ''),
                'store_location' => $this->get('store_location', ''),
                'store_instagram' => $this->get('store_instagram', ''),
                'store_tiktok' => $this->get('store_tiktok', ''),
                'school_name' => $this->get('school_name', ''),
                'school_address' => $this->get('school_address', ''),
                'school_phone' => $this->get('school_phone', ''),
                'school_email' => $this->get('school_email', ''),
                'timezone' => $this->get('timezone', 'Asia/Jakarta'),
                'currency' => strtoupper((string) $this->get('currency', 'IDR')),
                'logo_url' => $this->imageUrl('app_logo_path', asset('images/brand-placeholder.svg')),
                'logo_custom' => filled($this->get('app_logo_path')),
                'favicon_url' => $this->imageUrl('favicon_path', asset('favicon.svg')),
            ],
            'pos' => [
                'receipt_footer_text' => $this->get('receipt_footer_text', ''),
                'auto_print_receipt' => $this->boolean('pos_auto_print_receipt', true),
                'show_low_stock_warning' => $this->boolean('pos_show_low_stock_warning', true),
            ],
            'mail' => [
                'from_name' => $this->get('mail_from_name', config('mail.from.name')),
                'from_address' => $this->get('mail_from_address', config('mail.from.address')),
                'reply_to' => $this->get('mail_reply_to', config('mail.from.address')),
                'notifications_email' => $this->get('notifications_email', ''),
            ],
            'permissions' => [
                'self_registration' => $this->boolean('permission_self_registration', true),
                'cashier_refund' => $this->boolean('permission_cashier_refund', false),
            ],
            'backup' => [
                'enabled' => $this->boolean('backup_enabled', false),
                'schedule' => $this->get('backup_schedule', 'daily'),
                'retention_days' => (int) $this->get('backup_retention_days', 7),
            ],
            'appearance' => [
                'theme_mode' => $this->get('appearance_theme', 'dark'),
            ],
            'system' => [
                'maintenance_enabled' => $this->boolean('system_maintenance_enabled', false),
            ],
        ];
    }

    public function formData(): array
    {
        return [
            'branding' => [
                'app_name' => $this->get('app_name', config('app.name', 'TOKOTOKI')),
                'store_tagline' => $this->get('store_tagline', 'Kerajinan kecil, dekorasi yang berarti.'),
                'store_description' => $this->get('store_description', 'TOKOTOKI adalah toko kerajinan dan dekorasi yang menyediakan berbagai produk untuk melengkapi kebutuhan dekorasi, aksesoris, perlengkapan rumah, dan souvenir.'),
                'store_short_description' => $this->get('store_short_description', 'Toko Kerajinan & Dekorasi'),
                'store_whatsapp' => $this->get('store_whatsapp', ''),
                'store_email' => $this->get('store_email', ''),
                'store_location' => $this->get('store_location', ''),
                'store_instagram' => $this->get('store_instagram', ''),
                'store_tiktok' => $this->get('store_tiktok', ''),
                'school_name' => $this->get('school_name', ''),
                'school_address' => $this->get('school_address', ''),
                'school_phone' => $this->get('school_phone', ''),
                'school_email' => $this->get('school_email', ''),
                'timezone' => $this->get('timezone', 'Asia/Jakarta'),
                'currency' => strtoupper((string) $this->get('currency', 'IDR')),
                'logo_url' => $this->imageUrl('app_logo_path', asset('images/brand-placeholder.svg')),
                'logo_custom' => filled($this->get('app_logo_path')),
                'favicon_url' => $this->imageUrl('favicon_path', asset('favicon.svg')),
            ],
            'pos' => [
                'receipt_footer_text' => $this->get('receipt_footer_text', ''),
                'auto_print_receipt' => $this->boolean('pos_auto_print_receipt', true),
                'show_low_stock_warning' => $this->boolean('pos_show_low_stock_warning', true),
            ],
            'mail' => [
                'from_name' => $this->get('mail_from_name', config('mail.from.name')),
                'from_address' => $this->get('mail_from_address', config('mail.from.address')),
                'reply_to' => $this->get('mail_reply_to', config('mail.from.address')),
                'notifications_email' => $this->get('notifications_email', ''),
            ],
            'permissions' => [
                'self_registration' => $this->boolean('permission_self_registration', true),
                'cashier_refund' => $this->boolean('permission_cashier_refund', false),
            ],
            'backup' => [
                'enabled' => $this->boolean('backup_enabled', false),
                'schedule' => $this->get('backup_schedule', 'daily'),
                'retention_days' => (int) $this->get('backup_retention_days', 7),
            ],
            'appearance' => [
                'theme_mode' => $this->get('appearance_theme', 'dark'),
            ],
            'system' => [
                'maintenance_enabled' => $this->boolean('system_maintenance_enabled', false),
            ],
        ];
    }

    public function update(array $data, array $files = [], ?User $actor = null): void
    {
        foreach ($data as $key => $value) {
            if (in_array($key, self::PRESERVE_WHEN_EMPTY, true) && blank($value)) {
                continue;
            }

            $this->persist($key, $value, $actor?->id);
        }

        foreach ($files as $key => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $currentPath = $this->get($key);
            $directory = $key === 'favicon_path'
                ? 'settings/favicons'
                : 'settings/logos';

            // Store the new file first; only delete the old one after success.
            $storedPath = $file->storePublicly($directory, 'public');

            if (filled($currentPath) && $currentPath !== $storedPath) {
                Storage::disk('public')->delete($currentPath);
            }

            $this->persist($key, $storedPath, $actor?->id, 'file');
        }

        Cache::forget(self::CACHE_KEY);
    }

    public function removeFile(string $key, ?User $actor = null): void
    {
        $currentPath = $this->get($key);

        if (filled($currentPath)) {
            Storage::disk('public')->delete($currentPath);
        }

        $this->persist($key, '', $actor?->id, 'file');

        Cache::forget(self::CACHE_KEY);
    }

    private function persist(string $key, mixed $value, ?int $updatedBy = null, ?string $type = null): void
    {
        Setting::query()->updateOrCreate(
            ['key' => $key],
            [
                'group' => $this->groupForKey($key),
                'type' => $type ?? $this->typeForKey($key, $value),
                'value' => $this->normalizeValue($value, $type ?? $this->typeForKey($key, $value)),
                'updated_by' => $updatedBy,
            ],
        );
    }

    private function groupForKey(string $key): string
    {
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
                'school_name',
                'school_address',
                'school_phone',
                'school_email',
                'timezone',
                'currency',
                'app_logo_path',
                'favicon_path',
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
            'appearance' => ['appearance_theme'],
            'system' => ['system_maintenance_enabled'],
        ];

        foreach ($groupMap as $group => $keys) {
            if (in_array($key, $keys, true)) {
                return $group;
            }
        }

        return 'general';
    }

    private function typeForKey(string $key, mixed $value): string
    {
        if (str_ends_with($key, '_path')) {
            return 'file';
        }

        if (is_bool($value)) {
            return 'boolean';
        }

        return match ($key) {
            'receipt_footer_text',
            'school_address' => 'text',
            'backup_retention_days' => 'integer',
            default => 'string',
        };
    }

    private function normalizeValue(mixed $value, string $type): string
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            'integer' => (string) ((int) $value),
            default => (string) $value,
        };
    }

    private function castValue(?string $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            default => $value,
        };
    }
}
