<?php

namespace Tests\Feature\Store;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicStoreCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_only_lists_active_serkom_categories_and_supports_search_with_category(): void
    {
        $visible = $this->product(['name' => 'Vas Bambu', 'category' => 'Dekorasi']);
        $this->product(['name' => 'Gel Pen Blue', 'category' => 'Stationery']);
        $this->product(['name' => 'Vas Tidak Aktif', 'category' => 'Dekorasi', 'status' => 'inactive']);

        $this->get(route('store.catalog', ['search' => 'Vas', 'category' => 'Dekorasi']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('filters.search', 'Vas')
                ->where('filters.category', 'Dekorasi')
                ->has('products.data', 1)
                ->where('products.data.0.id', $visible->id));

        $this->get(route('store.catalog'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.id', $visible->id));
    }

    public function test_non_serkom_product_cannot_be_added_updated_or_checked_out_in_public_store(): void
    {
        $product = $this->product(['category' => 'Stationery']);

        $this->post(route('store.cart.store', $product), ['quantity' => 1])
            ->assertSessionHasErrors('product');

        $this->withSession(['store.cart' => [$product->id => 1]])
            ->patch(route('store.cart.update', $product), ['quantity' => 1])
            ->assertSessionHasErrors('product');

        $this->withSession(['store.cart' => [$product->id => 1], 'store.cart_checkout_token' => 'legacy-cart-token'])
            ->post(route('store.checkout.store'), [
                'customer_name' => 'Siti Pembeli',
                'customer_phone' => '081234567890',
                'customer_address' => 'Alamat pengambilan',
                'payment_method' => 'cash',
            ])
            ->assertSessionHasErrors('cart');

        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 10]);
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
