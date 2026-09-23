<?php

namespace Tests\Feature\Store;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAccountTest extends TestCase
{
    use RefreshDatabase;

    // A. Customer register berhasil.
    public function test_customer_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Budi Pembeli',
            'email' => 'budi@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('store.home', absolute: false));
        $this->assertAuthenticatedAs(User::where('email', 'budi@example.com')->firstOrFail());
        $this->assertSame(UserRole::Customer, User::where('email', 'budi@example.com')->firstOrFail()->role);
        $this->assertDatabaseHas('users', ['email' => 'budi@example.com', 'role' => 'customer']);
    }

    public function test_customer_register_validates_unique_email_and_password_confirmation(): void
    {
        User::factory()->customer()->create(['email' => 'budi@example.com']);

        $this->post('/register', [
            'name' => 'Budi Lagi',
            'email' => 'budi@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertSessionHasErrors('email');

        $this->post('/register', [
            'name' => 'Budi Baru',
            'email' => 'baru@example.com',
            'password' => 'password',
            'password_confirmation' => 'berbeda',
        ])->assertSessionHasErrors('password');

        $this->assertDatabaseMissing('users', ['email' => 'baru@example.com']);
    }

    // B. Customer login berhasil.
    public function test_customer_can_login(): void
    {
        $customer = User::factory()->customer()->create();

        $this->post('/login', ['email' => $customer->email, 'password' => 'password'])
            ->assertRedirect(route('store.home', absolute: false));

        $this->assertAuthenticatedAs($customer);
    }

    public function test_login_with_wrong_password_shows_clear_error(): void
    {
        $customer = User::factory()->customer()->create();

        $this->post('/login', ['email' => $customer->email, 'password' => 'salah'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    // C. Customer logout berhasil.
    public function test_customer_can_logout(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    // D+E. Customer tidak bisa akses admin & POS (redirect, bukan 403 — pola existing).
    public function test_customer_cannot_access_admin_pages(): void
    {
        $customer = User::factory()->customer()->create();

        foreach (['admin.dashboard', 'admin.products.index', 'admin.reports.index', 'admin.users.index', 'admin.settings'] as $route) {
            $this->actingAs($customer)->get(route($route))->assertRedirect(route('store.home'));
        }
    }

    public function test_customer_cannot_access_pos(): void
    {
        $customer = User::factory()->customer()->create();

        $this->actingAs($customer)->get(route('pos.index'))->assertRedirect(route('store.home'));
        $this->actingAs($customer)->post(route('pos.checkout'), [])->assertRedirect(route('store.home'));
    }

    // F. Customer bisa melihat order miliknya.
    public function test_customer_can_view_own_orders(): void
    {
        $customer = User::factory()->customer()->create();
        $product = $this->product();

        $this->actingAs($customer)
            ->withSession(['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'tok'])
            ->post(route('store.checkout.store'), $this->customerPayload())
            ->assertRedirect();

        $transaction = Transaction::query()->firstOrFail();
        $this->assertSame($customer->id, $transaction->user_id);

        $this->actingAs($customer)->get(route('store.account'))->assertOk();
        $this->actingAs($customer)->get(route('store.orders.index'))->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('orders.data', 1)
                ->where('orders.data.0.invoice_number', $transaction->invoice_number));
        $this->actingAs($customer)->get(route('store.orders.show', $transaction))->assertOk()
            ->assertInertia(fn ($page) => $page->where('order.invoice_number', $transaction->invoice_number));
    }

    // G. Customer tidak bisa melihat order customer lain.
    public function test_customer_cannot_view_other_customers_orders(): void
    {
        $owner = User::factory()->customer()->create();
        $intruder = User::factory()->customer()->create();
        $product = $this->product();

        $this->actingAs($owner)
            ->withSession(['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'tok'])
            ->post(route('store.checkout.store'), $this->customerPayload())
            ->assertRedirect();

        $transaction = Transaction::query()->firstOrFail();

        $this->actingAs($intruder)->get(route('store.orders.show', $transaction))->assertNotFound();
        $this->actingAs($intruder)->get(route('store.orders.index'))->assertOk()
            ->assertInertia(fn ($page) => $page->has('orders.data', 0));

        // Guest checkout lama (user_id NULL) juga tidak bisa dibuka siapa pun.
        $this->actingAs($intruder)->get(route('store.orders.show', Transaction::query()->create([
            'invoice_number' => 'INV-STORE-GUEST-1',
            'source' => 'store',
            'user_id' => null,
            'customer_name' => 'Guest',
            'customer_phone' => '081234567890',
            'customer_address' => 'Alamat',
            'subtotal_price' => 10000,
            'tax_price' => 1100,
            'discount_price' => 0,
            'total_price' => 11100,
            'payment_method' => 'cash',
            'payment_status' => 'pending',
        ])))->assertNotFound();
    }

    // H. Guest checkout existing tetap berhasil (user_id NULL).
    public function test_guest_checkout_still_works(): void
    {
        $product = $this->product();

        $this->withSession(['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'guest-tok'])
            ->post(route('store.checkout.store'), $this->customerPayload())
            ->assertRedirect();

        $transaction = Transaction::query()->firstOrFail();
        $this->assertNull($transaction->user_id);
        $this->assertSame('store', $transaction->source);
    }

    // I+J. Admin & kasir login existing tetap berhasil.
    public function test_admin_login_still_works(): void
    {
        $admin = User::factory()->superAdmin()->create();

        $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
            ->assertRedirect(route('admin.dashboard', absolute: false));
        $this->assertAuthenticatedAs($admin);
    }

    public function test_kasir_login_still_works(): void
    {
        $kasir = User::factory()->create(['role' => UserRole::Kasir]);

        $this->post('/login', ['email' => $kasir->email, 'password' => 'password'])
            ->assertRedirect(route('pos.index', absolute: false));
        $this->assertAuthenticatedAs($kasir);
    }

    // K+L+M. Public catalog, cart, checkout tetap berhasil.
    public function test_public_catalog_cart_and_checkout_still_work(): void
    {
        $product = $this->product();

        $this->get(route('store.catalog'))->assertOk();
        $this->get(route('store.products.show', $product))->assertOk();

        $this->post(route('store.cart.store', $product), ['quantity' => 1])->assertRedirect();
        $this->withSession(['store.cart' => [$product->id => 1]])
            ->patch(route('store.cart.update', $product), ['quantity' => 2])->assertRedirect();
        $this->get(route('store.cart.index'))->assertOk();

        $this->withSession(['store.cart' => [$product->id => 2], 'store.cart_checkout_token' => 'tok'])
            ->post(route('store.checkout.store'), $this->customerPayload())
            ->assertRedirect();
        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_guest_cannot_open_customer_pages(): void
    {
        $this->get(route('store.account'))->assertRedirect(route('login'));
        $this->get(route('store.orders.index'))->assertRedirect(route('login'));
    }

    private function product(array $overrides = []): Product
    {
        return Product::query()->create(array_merge([
            'barcode' => '899000000'.str_pad((string) (Product::query()->count() + 1), 4, '0', STR_PAD_LEFT),
            'name' => 'Produk Uji',
            'category' => 'Dekorasi',
            'purchase_price' => 5000,
            'selling_price' => 10000,
            'stock' => 10,
            'min_stock' => 1,
            'status' => 'active',
        ], $overrides));
    }

    private function customerPayload(): array
    {
        return [
            'customer_name' => 'Siti Pembeli',
            'customer_phone' => '081234567890',
            'customer_address' => 'Catatan pengambilan di koperasi',
            'payment_method' => 'cash',
        ];
    }
}
