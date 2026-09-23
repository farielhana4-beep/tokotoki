<?php

namespace App\Services\Store;

use App\Models\Product;
use Illuminate\Session\Store;
use Illuminate\Validation\ValidationException;

class CartService
{
    private const SESSION_KEY = 'store.cart';
    private const CHECKOUT_TOKEN_KEY = 'store.cart_checkout_token';
    private const PUBLIC_CATEGORIES = ['Dekorasi', 'Aksesoris', 'Perlengkapan Rumah', 'Souvenir'];

    public function count(Store $session): int
    {
        return array_sum($this->raw($session));
    }

    public function quantities(Store $session): array
    {
        return $this->raw($session);
    }

    public function clear(Store $session): void
    {
        $session->forget(self::SESSION_KEY);
        $session->forget(self::CHECKOUT_TOKEN_KEY);
    }

    public function checkoutToken(Store $session): string
    {
        $token = (string) $session->get(self::CHECKOUT_TOKEN_KEY, '');

        if ($token !== '') {
            return $token;
        }

        $cart = $this->raw($session);

        return $cart === []
            ? ''
            : hash('sha256', $session->getId().'|'.json_encode($cart));
    }

    public function add(Store $session, Product $product, int $quantity): void
    {
        $this->ensurePurchasable($product, $quantity);
        $cart = $this->raw($session);
        $currentQuantity = (int) ($cart[$product->id] ?? 0);

        if ($currentQuantity + $quantity > $product->stock) {
            throw ValidationException::withMessages(['quantity' => "Jumlah {$product->name} di keranjang melebihi stok yang tersedia."]);
        }

        $cart[$product->id] = $currentQuantity + $quantity;
        $session->put(self::SESSION_KEY, $cart);
        $this->ensureCheckoutToken($session);
    }

    public function update(Store $session, Product $product, int $quantity): void
    {
        $this->ensurePurchasable($product, $quantity);
        $cart = $this->raw($session);

        if (! array_key_exists($product->id, $cart)) {
            throw ValidationException::withMessages(['quantity' => 'Produk belum ada di keranjang.']);
        }

        $cart[$product->id] = $quantity;
        $session->put(self::SESSION_KEY, $cart);
        $this->ensureCheckoutToken($session);
    }

    public function remove(Store $session, int $productId): void
    {
        $cart = $this->raw($session);
        unset($cart[$productId]);
        $session->put(self::SESSION_KEY, $cart);

        if ($cart === []) {
            $session->forget(self::CHECKOUT_TOKEN_KEY);
        }
    }

    public function details(Store $session): array
    {
        $cart = $this->raw($session);
        $products = Product::query()->whereIn('id', array_keys($cart))->get()->keyBy('id');
        $items = collect($cart)->map(function (int $quantity, int|string $productId) use ($products): array {
            $product = $products->get((int) $productId);

            if (! $product) {
                return ['product_id' => (int) $productId, 'product' => null, 'quantity' => $quantity, 'available' => false, 'message' => 'Produk ini sudah tidak tersedia.', 'line_total' => 0];
            }

            $available = $this->isPublicProduct($product) && $product->stock > 0 && $quantity <= $product->stock;

            return [
                'product_id' => $product->id,
                'product' => ['id' => $product->id, 'name' => $product->name, 'category' => $product->category ?: 'Lainnya', 'image_url' => $product->imageUrl(), 'selling_price' => (float) $product->selling_price, 'stock' => $product->stock],
                'quantity' => $quantity,
                'available' => $available,
                'message' => $this->availabilityMessage($product, $quantity),
                'line_total' => (float) $product->selling_price * $quantity,
            ];
        })->values();

        return ['items' => $items, 'subtotal' => $items->sum('line_total'), 'has_availability_issue' => $items->contains('available', false)];
    }

    private function raw(Store $session): array
    {
        return collect($session->get(self::SESSION_KEY, []))->mapWithKeys(fn ($quantity, $productId) => [(int) $productId => max((int) $quantity, 0)])->filter(fn (int $quantity) => $quantity > 0)->all();
    }

    private function ensureCheckoutToken(Store $session): void
    {
        if (! $session->has(self::CHECKOUT_TOKEN_KEY)) {
            $session->put(self::CHECKOUT_TOKEN_KEY, (string) str()->uuid());
        }
    }

    private function ensurePurchasable(Product $product, int $quantity): void
    {
        if (! $this->isPublicProduct($product)) throw ValidationException::withMessages(['product' => 'Produk ini tidak tersedia di toko online.']);
        if ($product->stock < 1) throw ValidationException::withMessages(['product' => 'Stok produk sedang habis.']);
        if ($quantity > $product->stock) throw ValidationException::withMessages(['quantity' => "Jumlah maksimal untuk {$product->name} adalah {$product->stock}."]);
    }

    public function isPublicProduct(Product $product): bool
    {
        return $product->isActive() && in_array($product->category, self::PUBLIC_CATEGORIES, true);
    }

    private function availabilityMessage(Product $product, int $quantity): ?string
    {
        if (! $this->isPublicProduct($product)) return 'Produk ini tidak tersedia di toko online.';
        if ($product->stock < 1) return 'Stok produk ini sedang habis.';
        if ($quantity > $product->stock) return "Stok terbaru hanya {$product->stock}. Sesuaikan jumlah pesanan Anda.";
        return null;
    }
}
