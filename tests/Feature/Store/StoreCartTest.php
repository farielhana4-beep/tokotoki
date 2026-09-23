<?php

namespace Tests\Feature\Store;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreCartTest extends TestCase
{
    use RefreshDatabase;

    public function test_storefront_shares_centralized_branding(): void
    {
        $this->product();

        $this->get(route('store.home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('settings.branding.app_name', 'TOKOTOKI')
                ->where('settings.branding.store_tagline', 'Kerajinan kecil, dekorasi yang berarti.')
                ->has('settings.branding.store_description'));

        // Renaming the store in settings flows to the storefront without code changes.
        \App\Models\Setting::query()->updateOrCreate(
            ['key' => 'app_name'],
            ['group' => 'branding', 'type' => 'string', 'value' => 'Toko Baru'],
        );
        \Illuminate\Support\Facades\Cache::forget('koperasi_pos.settings');

        $this->get(route('store.catalog'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('settings.branding.app_name', 'Toko Baru'));
    }

    public function test_guest_can_add_product_to_cart(): void
    {
        $product = $this->product(['stock' => 5]);

        $response = $this->post(route('store.cart.store', $product), ['quantity' => 1]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertSame([$product->id => 1], session('store.cart'));
    }

    public function test_guest_can_increase_quantity_from_1_to_2(): void
    {
        $product = $this->product(['stock' => 5]);

        $this->withSession(['store.cart' => [$product->id => 1]])
            ->patch(route('store.cart.update', $product), ['quantity' => 2])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame([$product->id => 2], session('store.cart'));
    }

    public function test_guest_can_decrease_quantity_from_2_to_1(): void
    {
        $product = $this->product(['stock' => 5]);

        $this->withSession(['store.cart' => [$product->id => 2]])
            ->patch(route('store.cart.update', $product), ['quantity' => 1])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame([$product->id => 1], session('store.cart'));
    }

    public function test_guest_can_remove_item_from_cart(): void
    {
        $product = $this->product(['stock' => 5]);

        $this->withSession(['store.cart' => [$product->id => 2], 'store.cart_checkout_token' => 'token'])
            ->delete(route('store.cart.destroy', $product->id))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame([], session('store.cart', []));
    }

    public function test_cart_stays_correct_after_reload(): void
    {
        $product = $this->product(['stock' => 5, 'selling_price' => 10000]);

        $this->withSession(['store.cart' => [$product->id => 1]])
            ->patch(route('store.cart.update', $product), ['quantity' => 2])
            ->assertRedirect();

        $this->withSession(['store.cart' => [$product->id => 2]])
            ->get(route('store.cart.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('cart.items', 1)
                ->where('cart.items.0.quantity', 2)
                ->where('cart.items.0.product.id', $product->id));
    }

    public function test_cart_flash_message_is_shared_with_inertia_props(): void
    {
        $product = $this->product(['stock' => 5]);

        $this->post(route('store.cart.store', $product), ['quantity' => 1])
            ->assertSessionHas('success');

        $this->get(route('store.cart.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('flash.success'));
    }

    public function test_quantity_beyond_stock_is_rejected_without_side_effects(): void
    {
        $product = $this->product(['stock' => 2]);

        $this->withSession(['store.cart' => [$product->id => 1]])
            ->patch(route('store.cart.update', $product), ['quantity' => 5])
            ->assertSessionHasErrors('quantity');

        $this->assertSame([$product->id => 1], session('store.cart'));
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 2]);
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
}
