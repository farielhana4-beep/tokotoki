<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\Store\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicStoreController extends Controller
{
    private const CATEGORIES = ['Dekorasi', 'Aksesoris', 'Perlengkapan Rumah', 'Souvenir'];

    public function __construct(private readonly CartService $cart) {}

    public function home(): Response
    {
        return Inertia::render('Store/Home', [
            'categories' => self::CATEGORIES,
            'categoryCounts' => $this->categoryCounts(),
            'featuredProducts' => Product::query()
                ->where('status', 'active')
                ->whereIn('category', self::CATEGORIES)
                ->latest()
                ->take(4)
                ->get()
                ->map(fn (Product $product) => $this->productPayload($product))
                ->values(),
            'cartCount' => $this->cart->count(request()->session()),
        ]);
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $category = trim((string) $request->string('category'));

        $products = Product::query()
            ->where('status', 'active')
            ->whereIn('category', self::CATEGORIES)
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->when(in_array($category, self::CATEGORIES, true), fn ($query) => $query->where('category', $category))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => $this->productPayload($product));

        return Inertia::render('Store/Catalog', [
            'products' => $products,
            'categories' => self::CATEGORIES,
            'categoryCounts' => $this->categoryCounts(),
            'filters' => [
                'search' => $search,
                'category' => in_array($category, self::CATEGORIES, true) ? $category : '',
            ],
            'cartCount' => $this->cart->count($request->session()),
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->isActive() && in_array($product->category, self::CATEGORIES, true), 404);

        return Inertia::render('Store/ProductDetail', [
            'product' => $this->productPayload($product, true),
            'cartCount' => $this->cart->count(request()->session()),
        ]);
    }

    private function categoryCounts(): array
    {
        $counts = Product::query()
            ->where('status', 'active')
            ->whereIn('category', self::CATEGORIES)
            ->selectRaw('category, COUNT(*) as total')
            ->groupBy('category')
            ->pluck('total', 'category')
            ->all();

        $result = [];

        foreach (self::CATEGORIES as $category) {
            $result[$category] = (int) ($counts[$category] ?? 0);
        }

        return $result;
    }

    private function productPayload(Product $product, bool $withDescription = false): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'category' => $product->category ?: 'Lainnya',
            'image_url' => $product->imageUrl(),
            'selling_price' => (float) $product->selling_price,
            'stock' => $product->stock,
            'in_stock' => $product->stock > 0,
            ...($withDescription ? ['description' => $product->description] : []),
        ];
    }
}
