<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_kasir_can_access_pos_and_transactions_only(): void
    {
        $kasir = User::factory()->create([
            'role' => UserRole::Kasir,
        ]);

        $this->actingAs($kasir)->get(route('pos.index'))->assertOk();
        $this->actingAs($kasir)->get(route('admin.transactions.index'))->assertOk();

        $this->actingAs($kasir)->get(route('admin.dashboard'))->assertRedirect(route('pos.index'));
        $this->actingAs($kasir)->get(route('admin.products.index'))->assertRedirect(route('pos.index'));
        $this->actingAs($kasir)->get(route('admin.reports.index'))->assertRedirect(route('pos.index'));
        $this->actingAs($kasir)->get(route('admin.users.index'))->assertRedirect(route('pos.index'));
        $this->actingAs($kasir)->get(route('admin.settings'))->assertRedirect(route('pos.index'));
    }

    public function test_super_admin_can_access_all_protected_pages(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)->get(route('admin.dashboard'))->assertOk();
        $this->actingAs($superAdmin)->get(route('pos.index'))->assertOk();
        $this->actingAs($superAdmin)->get(route('admin.transactions.index'))->assertOk();
        $this->actingAs($superAdmin)->get(route('admin.products.index'))->assertOk();
        $this->actingAs($superAdmin)->get(route('admin.reports.index'))->assertOk();
        $this->actingAs($superAdmin)->get(route('admin.users.index'))->assertOk();
        $this->actingAs($superAdmin)->get(route('admin.settings'))->assertOk();
    }
}
