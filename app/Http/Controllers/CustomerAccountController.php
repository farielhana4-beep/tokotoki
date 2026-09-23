<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAccountController extends Controller
{
    public function account(): Response
    {
        $user = request()->user();

        return Inertia::render('Store/Account', [
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'member_since' => optional($user->created_at)?->format('d M Y'),
                'order_count' => $user->transactions()->where('source', 'store')->count(),
            ],
        ]);
    }

    public function orders(): Response
    {
        $orders = request()->user()->transactions()
            ->with('details.product:id,barcode,name')
            ->where('source', 'store')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Transaction $transaction) => $this->orderSummary($transaction));

        return Inertia::render('Store/Orders', ['orders' => $orders]);
    }

    public function showOrder(Transaction $transaction): Response
    {
        abort_unless(
            $transaction->source === 'store' && (int) $transaction->user_id === (int) request()->user()->id,
            404,
        );

        $transaction->load('details.product:id,barcode,name');

        return Inertia::render('Store/OrderDetail', ['order' => $this->orderDetail($transaction)]);
    }

    private function orderSummary(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'invoice_number' => $transaction->invoice_number,
            'created_at' => optional($transaction->created_at)?->format('d M Y H:i'),
            'payment_status' => $transaction->payment_status->value,
            'payment_method' => $transaction->payment_method->value,
            'total' => (float) $transaction->total_price,
            'item_count' => $transaction->details->sum('quantity'),
        ];
    }

    private function orderDetail(Transaction $transaction): array
    {
        return [
            ...$this->orderSummary($transaction),
            'customer_name' => $transaction->customer_name,
            'customer_phone' => $transaction->customer_phone,
            'customer_address' => $transaction->customer_address,
            'subtotal' => (float) $transaction->subtotal_price,
            'tax' => (float) $transaction->tax_price,
            'items' => $transaction->details->map(fn ($detail) => [
                'name' => $detail->product?->name ?? 'Produk',
                'quantity' => $detail->quantity,
                'price' => (float) $detail->price,
                'subtotal' => (float) $detail->price * $detail->quantity,
            ])->values(),
        ];
    }
}
