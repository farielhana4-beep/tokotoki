<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_last_super_admin_cannot_delete_their_account(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->from('/profile')
            ->delete('/profile', ['password' => 'password'])
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($admin->fresh());
        $this->assertAuthenticatedAs($admin);
    }

    public function test_super_admin_can_delete_when_another_super_admin_exists(): void
    {
        $admin = User::factory()->superAdmin()->create();
        User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->delete('/profile', ['password' => 'password'])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($admin->fresh());
    }

    public function test_non_admin_self_delete_behavior_is_unchanged(): void
    {
        $kasir = User::factory()->create();

        $this->actingAs($kasir)
            ->delete('/profile', ['password' => 'password'])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertNull($kasir->fresh());

        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)
            ->delete('/profile', ['password' => 'password'])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertNull($customer->fresh());
    }

    public function test_super_admin_profile_update_still_works(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->actingAs($admin)
            ->patch('/profile', ['name' => 'Admin Baru', 'email' => $admin->email])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertSame('Admin Baru', $admin->fresh()->name);
    }
}
