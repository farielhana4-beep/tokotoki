<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCheckoutRequest;
use App\Models\Transaction;
use App\Services\Store\CartService;
use App\Services\Store\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class StoreCheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly CheckoutService $checkout,
    ) {
    }

    public function create(): Response|RedirectResponse
    {
        $cart = $this->cart->details(request()->session());

        if ($cart['items']->isEmpty() || $cart['has_availability_issue']) {
            return redirect()->route('store.cart.index')
                ->with('error', 'Periksa kembali ketersediaan produk di keranjang Anda.');
        }

        return Inertia::render('Store/Checkout', [
            'cart' => $cart,
            'cartCount' => $this->cart->count(request()->session()),
        ]);
    }

    public function store(StoreCheckoutRequest $request): RedirectResponse
    {
        $token = $this->cart->checkoutToken($request->session());

        if ($token === '') {
            return redirect()->route('store.cart.index')
                ->with('error', 'Keranjang belanja Anda masih kosong atau sudah diproses.');
        }

        $key = 'store-checkout:'.$token;
        $lock = Cache::lock($key, 15);

        if (! $lock->get()) {
            return back()->with('error', 'Pesanan sedang diproses. Mohon tunggu sebentar.');
        }

        try {
            if (Cache::has($key.':completed')) {
                return back()->with('error', 'Keranjang ini sudah berhasil diproses.');
            }

            $transaction = $this->checkout->checkout($request->session(), $request->validated(), $request->user()?->id);

            $this->cart->clear($request->session());
            $request->session()->put('store.last_order_id', $transaction->id);
            Cache::put($key.':completed', true, now()->addMinutes(10));
        } finally {
            $lock->release();
        }

        return redirect()->route('store.checkout.success', $transaction);
    }

    public function success(Transaction $transaction): Response
    {
        abort_unless(
            $transaction->source === 'store'
            && (int) request()->session()->get('store.last_order_id') === $transaction->id,
            404,
        );

        $transaction->load('details.product:id,barcode,name');

        return Inertia::render('Store/OrderSuccess', [
            'order' => [
                'invoice_number' => $transaction->invoice_number,
                'customer_name' => $transaction->customer_name,
                'customer_phone' => $transaction->customer_phone,
                'customer_address' => $transaction->customer_address,
                'payment_method' => $transaction->payment_method->value,
                'payment_status' => $transaction->payment_status->value,
                'subtotal' => (float) $transaction->subtotal_price,
                'tax' => (float) $transaction->tax_price,
                'total' => (float) $transaction->total_price,
                'items' => $transaction->details->map(fn ($detail) => [
                    'name' => $detail->product?->name,
                    'quantity' => $detail->quantity,
                    'price' => (float) $detail->price,
                    'subtotal' => (float) $detail->price * $detail->quantity,
                ])->values(),
            ],
            'cartCount' => 0,
        ]);
    }
}
