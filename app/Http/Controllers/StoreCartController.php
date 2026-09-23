<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCartQuantityRequest;
use App\Models\Product;
use App\Services\Store\CartService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StoreCartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(): Response
    {
        return Inertia::render('Store/Cart', ['cart' => $this->cart->details(request()->session()), 'cartCount' => $this->cart->count(request()->session())]);
    }

    public function store(StoreCartQuantityRequest $request, Product $product): RedirectResponse
    {
        $this->cart->add($request->session(), $product, $request->integer('quantity'));
        return back()->with('success', "{$product->name} ditambahkan ke keranjang.");
    }

    public function update(StoreCartQuantityRequest $request, Product $product): RedirectResponse
    {
        $this->cart->update($request->session(), $product, $request->integer('quantity'));
        return back()->with('success', 'Jumlah produk diperbarui.');
    }

    public function destroy(int $productId): RedirectResponse
    {
        $this->cart->remove(request()->session(), $productId);
        return back()->with('success', 'Produk dihapus dari keranjang.');
    }
}
