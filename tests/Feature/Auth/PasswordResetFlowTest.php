<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_kasir_can_request_password_reset_link(): void
    {
        Notification::fake();

        $kasir = User::factory()->create([
            'role' => UserRole::Kasir,
            'email' => 'kasir@example.test',
        ]);

        $response = $this->post(route('password.email'), [
            'email' => $kasir->email,
        ]);

        $response->assertSessionHas('status');

        Notification::assertSentTo($kasir, ResetPasswordNotification::class);
    }

    public function test_super_admin_cannot_request_self_service_password_reset(): void
    {
        Notification::fake();

        $superAdmin = User::factory()->superAdmin()->create([
            'email' => 'admin@example.test',
        ]);

        $response = $this->post(route('password.email'), [
            'email' => $superAdmin->email,
        ]);

        $response->assertSessionHasErrors('email');
        Notification::assertNothingSent();
    }

    public function test_super_admin_can_reset_another_admin_password_from_user_management(): void
    {
        Notification::fake();

        $actor = User::factory()->superAdmin()->create([
            'email' => 'leader@example.test',
        ]);

        $target = User::factory()->superAdmin()->create([
            'email' => 'second-admin@example.test',
        ]);

        $response = $this->actingAs($actor)->post(route('admin.users.password-reset', $target));

        $response->assertSessionHas('status');
        Notification::assertSentTo($target, ResetPasswordNotification::class);
    }

    public function test_super_admin_cannot_reset_own_password_from_user_management(): void
    {
        $actor = User::factory()->superAdmin()->create([
            'email' => 'leader@example.test',
        ]);

        $response = $this->actingAs($actor)->post(route('admin.users.password-reset', $actor));

        $response->assertStatus(422);
    }
}
