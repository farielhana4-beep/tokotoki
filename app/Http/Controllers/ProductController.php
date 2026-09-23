<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $products = Product::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('barcode', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'barcode' => $product->barcode,
                'name' => $product->name,
                'category' => $this->displayCategory($product),
                'description' => $product->description,
                'image_path' => $product->image_path,
                'image_url' => $product->imageUrl(),
                'purchase_price' => $product->purchase_price,
                'selling_price' => $product->selling_price,
                'stock' => $product->stock,
                'min_stock' => $product->min_stock,
                'status' => $product->status ?? 'active',
                'is_active' => ($product->status ?? 'active') === 'active',
                'stock_status' => $product->stock <= $product->min_stock
                    ? 'critical'
                    : ($product->stock <= max($product->min_stock * 2, 5) ? 'warning' : 'good'),
            ]);

        $categories = Product::query()
            ->select('category')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->push('General')
            ->unique()
            ->values();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
            ],
            'stats' => [
                'total_products' => Product::count(),
                'low_stock_products' => Product::query()
                    ->whereColumn('stock', '<=', 'min_stock')
                    ->count(),
                'categories' => Product::query()
                    ->get()
                    ->map(fn (Product $product) => $this->displayCategory($product))
                    ->unique()
                    ->count(),
            ],
            'categoriesList' => $categories,
            'recentProducts' => Product::query()
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (Product $product) => [
                    'name' => $product->name,
                    'barcode' => $product->barcode,
                    'category' => $this->displayCategory($product),
                    'status' => $product->status ?? 'active',
                    'image_url' => $product->imageUrl(),
                    'stock' => $product->stock,
                ]),
        ]);
    }

    public function store(ProductStoreRequest $request): RedirectResponse
    {
        $validated = $this->normalizeValidatedProductData($request->validated());
        $validated['image_path'] = $this->storeImage($request->file('image'));

        Product::create($validated);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function update(ProductUpdateRequest $request, Product $product): RedirectResponse
    {
        $validated = $this->normalizeValidatedProductData($request->validated(), $product);
        $newImagePath = $this->storeImage($request->file('image'));

        if ($newImagePath) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $validated['image_path'] = $newImagePath;
        }

        $product->update($validated);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    private function normalizeValidatedProductData(array $validated, ?Product $product = null): array
    {
        $validated['category'] = trim((string) ($validated['category'] ?? ''))
            ?: $this->resolveCategoryFromName((string) ($validated['name'] ?? $product?->name ?? ''));
        $validated['description'] = trim((string) ($validated['description'] ?? '')) ?: null;
        $validated['status'] = $validated['status'] ?? 'active';

        return $validated;
    }

    private function storeImage(?UploadedFile $image): ?string
    {
        if (! $image) {
            return null;
        }

        return $image->store('products', 'public');
    }

    private function displayCategory(Product $product): string
    {
        return trim((string) $product->category) !== ''
            ? (string) $product->category
            : $this->resolveCategoryFromName((string) $product->name);
    }

    private function resolveCategoryFromName(string $name): string
    {
        $name = strtolower($name);

        return match (true) {
            str_contains($name, 'water'),
            str_contains($name, 'juice'),
            str_contains($name, 'tea'),
            str_contains($name, 'coffee'),
            str_contains($name, 'milk'),
            str_contains($name, 'drink'),
            str_contains($name, 'soda') => 'Beverages',
            str_contains($name, 'snack'),
            str_contains($name, 'chips'),
            str_contains($name, 'cracker'),
            str_contains($name, 'biscuit'),
            str_contains($name, 'candy') => 'Snacks',
            str_contains($name, 'pen'),
            str_contains($name, 'book'),
            str_contains($name, 'paper'),
            str_contains($name, 'stationery') => 'Stationery',
            str_contains($name, 'soap'),
            str_contains($name, 'tissue'),
            str_contains($name, 'detergent'),
            str_contains($name, 'shampoo') => 'Essentials',
            default => 'General',
        };
    }
}
