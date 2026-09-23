<?php

namespace Tests\Feature\Settings;

use App\Enums\UserRole;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettingsModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_update_settings_and_upload_branding_files(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.settings.update'), [
                'app_name' => 'Koperasi POS',
                'school_name' => 'SMA 1',
                'school_address' => 'Jl. Merdeka 1',
                'school_phone' => '08123456789',
                'school_email' => 'admin@example.test',
                'receipt_footer_text' => 'Terima kasih.',
                'pos_auto_print_receipt' => true,
                'pos_show_low_stock_warning' => true,
                'appearance_theme' => 'dark',
                'system_maintenance_enabled' => false,
                'app_logo' => UploadedFile::fake()->image('logo.png', 512, 512),
                'favicon' => UploadedFile::fake()->image('favicon.png', 64, 64),
            ])
            ->assertRedirect(route('admin.settings'));

        $this->assertDatabaseHas('settings', [
            'key' => 'app_name',
            'value' => 'Koperasi POS',
        ]);

        $this->assertDatabaseMissing('settings', [
            'key' => 'midtrans_server_key',
        ]);

        $this->assertTrue(Setting::query()->where('key', 'app_logo_path')->exists());
        $this->assertTrue(Setting::query()->where('key', 'favicon_path')->exists());

        $logoPath = Setting::query()->where('key', 'app_logo_path')->value('value');
        $faviconPath = Setting::query()->where('key', 'favicon_path')->value('value');

        Storage::disk('public')->assertExists($logoPath);
        Storage::disk('public')->assertExists($faviconPath);
    }

    public function test_super_admin_can_update_store_contacts_and_remove_logo(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'email_verified_at' => now(),
        ]);

        Setting::query()->updateOrCreate(
            ['key' => 'app_logo_path'],
            ['group' => 'branding', 'type' => 'file', 'value' => 'settings/logos/old-logo.png'],
        );
        Storage::disk('public')->put('settings/logos/old-logo.png', 'fake-image');

        $this->actingAs($admin)
            ->post(route('admin.settings.update'), [
                'app_name' => 'TOKOTOKI',
                'store_tagline' => 'Kerajinan kecil, dekorasi yang berarti.',
                'store_short_description' => 'Toko Kerajinan & Dekorasi',
                'store_whatsapp' => '0812-3456-7890',
                'store_email' => 'toko@example.test',
                'store_location' => 'Ponorogo',
                'store_instagram' => 'https://instagram.com/tokotoki',
                'store_tiktok' => 'https://tiktok.com/@tokotoki',
                'appearance_theme' => 'dark',
                'remove_app_logo' => true,
            ])
            ->assertRedirect(route('admin.settings'));

        $this->assertDatabaseHas('settings', ['key' => 'store_whatsapp', 'value' => '0812-3456-7890']);
        $this->assertDatabaseHas('settings', ['key' => 'store_instagram', 'value' => 'https://instagram.com/tokotoki']);
        $this->assertDatabaseHas('settings', ['key' => 'app_logo_path', 'value' => '']);
        Storage::disk('public')->assertMissing('settings/logos/old-logo.png');

        // Invalid whatsapp / social URLs are rejected, logo stays removed state untouched.
        $this->actingAs($admin)
            ->post(route('admin.settings.update'), [
                'app_name' => 'TOKOTOKI',
                'store_whatsapp' => 'not-a-number!!!',
                'store_instagram' => 'bukan-url',
                'appearance_theme' => 'dark',
            ])
            ->assertSessionHasErrors(['store_whatsapp', 'store_instagram']);
    }

    public function test_kasir_cannot_access_settings(): void
    {
        $kasir = User::factory()->create([
            'role' => UserRole::Kasir,
            'email_verified_at' => now(),
        ]);

        // Unauthorized roles are redirected to their home page (existing design).
        $this->actingAs($kasir)
            ->get(route('admin.settings'))
            ->assertRedirect(route('pos.index'));
    }

    public function test_maintenance_mode_blocks_kasir_but_not_super_admin(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::SuperAdmin,
            'email_verified_at' => now(),
        ]);

        $kasir = User::factory()->create([
            'role' => UserRole::Kasir,
            'email_verified_at' => now(),
        ]);

        Setting::query()->updateOrCreate(
            ['key' => 'system_maintenance_enabled'],
            [
                'group' => 'system',
                'type' => 'boolean',
                'value' => '1',
            ],
        );

        $this->actingAs($kasir)
            ->get(route('admin.dashboard'))
            ->assertRedirect(route('maintenance'));

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk();
    }
}
