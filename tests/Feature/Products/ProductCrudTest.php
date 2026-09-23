<?php

namespace Tests\Feature\Products;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_product_index(): void
    {
        $user = User::factory()->superAdmin()->create();

        Product::query()->create([
            'barcode' => '9999999999999',
            'name' => 'Sample Product',
            'purchase_price' => 1000,
            'selling_price' => 1500,
            'stock' => 10,
            'min_stock' => 2,
        ]);

        $this->actingAs($user)
            ->get(route('admin.products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Products/Index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Sample Product')
                ->has('stats')
                ->has('products.data.0.image_url')
            );
    }

    public function test_super_admin_can_create_update_and_delete_product(): void
    {
        $user = User::factory()->superAdmin()->create();
        Storage::fake('public');

        $this->actingAs($user)->post(route('admin.products.store'), [
            'barcode' => '8991234567890',
            'name' => 'Mineral Water',
            'image' => UploadedFile::fake()->image('water.png', 1200, 1200)->size(800),
            'purchase_price' => 3000,
            'selling_price' => 5000,
            'stock' => 50,
            'min_stock' => 10,
            'status' => 'active',
        ])->assertRedirect(route('admin.products.index'));

        $product = Product::query()->where('barcode', '8991234567890')->firstOrFail();
        $originalImagePath = $product->image_path;

        Storage::disk('public')->assertExists($originalImagePath);

        $this->actingAs($user)->put(route('admin.products.update', $product), [
            'barcode' => '8991234567890',
            'name' => 'Mineral Water 600ml',
            'image' => UploadedFile::fake()->image('water-new.png', 1200, 1200)->size(700),
            'purchase_price' => 3500,
            'selling_price' => 5500,
            'stock' => 40,
            'min_stock' => 8,
            'status' => 'active',
        ])->assertRedirect(route('admin.products.index'));

        $product->refresh();
        Storage::disk('public')->assertMissing($originalImagePath);
        Storage::disk('public')->assertExists($product->image_path);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Mineral Water 600ml',
            'stock' => 40,
            'min_stock' => 8,
        ]);

        $this->actingAs($user)->delete(route('admin.products.destroy', $product))
            ->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
    }

    public function test_product_image_validation_rejects_invalid_files(): void
    {
        $user = User::factory()->superAdmin()->create();

        $this->actingAs($user)->post(route('admin.products.store'), [
            'barcode' => '8991234567999',
            'name' => 'Invalid Image Product',
            'image' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
            'purchase_price' => 1000,
            'selling_price' => 2000,
            'stock' => 10,
            'min_stock' => 2,
        ])->assertSessionHasErrors('image');
    }

    public function test_products_index_supports_search(): void
    {
        $user = User::factory()->superAdmin()->create();

        Product::query()->create([
            'barcode' => '1111111111111',
            'name' => 'Blue Pen',
            'purchase_price' => 1000,
            'selling_price' => 2000,
            'stock' => 100,
            'min_stock' => 10,
        ]);

        Product::query()->create([
            'barcode' => '2222222222222',
            'name' => 'Notebook',
            'purchase_price' => 5000,
            'selling_price' => 7000,
            'stock' => 20,
            'min_stock' => 5,
        ]);

        $this->actingAs($user)
            ->get(route('admin.products.index', ['search' => 'Notebook']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Products/Index')
                ->where('filters.search', 'Notebook')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Notebook')
                ->has('products.data.0.image_url')
            );
    }
}
