<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status', 'all'));
        $paymentMethod = trim((string) $request->string('payment_method', 'all'));
        $date = trim((string) $request->string('date'));

        $transactions = Transaction::query()
            ->with([
                'user:id,name',
                'details.product:id,barcode,name',
            ])
            ->where('invoice_number', 'not like', 'INV-DEMO-%')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status !== 'all', fn ($query) => $query->where('payment_status', $status))
            ->when($paymentMethod !== 'all', fn ($query) => $query->where('payment_method', $paymentMethod))
            ->when($date !== '', fn ($query) => $query->whereDate('created_at', $date))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Transaction $transaction) => $this->mapTransaction($transaction));

        $summary = [
            'total' => Transaction::query()
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->count(),
            'paid' => Transaction::query()
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->where('payment_status', PaymentStatus::Paid->value)
                ->count(),
            'pending' => Transaction::query()
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->where('payment_status', PaymentStatus::Pending->value)
                ->count(),
            'qris' => Transaction::query()
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->where('payment_method', PaymentMethod::Qris->value)
                ->where('payment_status', PaymentStatus::Pending->value)
                ->count(),
        ];

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'date' => $date,
            ],
            'summary' => $summary,
            'statusOptions' => array_merge(
                [['label' => 'All Status', 'value' => 'all']],
                array_map(
                    fn (PaymentStatus $item) => [
                        'label' => $item->label(),
                        'value' => $item->value,
                    ],
                    PaymentStatus::cases(),
                ),
            ),
            'paymentMethodOptions' => array_merge(
                [['label' => 'All Methods', 'value' => 'all']],
                array_map(
                    fn (PaymentMethod $item) => [
                        'label' => $item->label(),
                        'value' => $item->value,
                    ],
                    PaymentMethod::cases(),
                ),
            ),
        ]);
    }

    private function mapTransaction(Transaction $transaction): array
    {
        $transaction->loadMissing(['details.product:id,barcode,name', 'user:id,name']);

        $items = $transaction->details->map(fn ($detail) => [
            'product_id' => $detail->product_id,
            'barcode' => $detail->product?->barcode,
            'name' => $detail->product?->name,
            'quantity' => $detail->quantity,
            'price' => (float) $detail->price,
            'subtotal' => (float) $detail->price * $detail->quantity,
        ])->values()->all();

        return [
            'id' => $transaction->id,
            'invoice_number' => $transaction->invoice_number,
            'source' => $transaction->source ?? 'pos',
            'payment_method' => $transaction->payment_method->value,
            'payment_status' => $transaction->payment_status->value,
            'subtotal' => (float) $transaction->subtotal_price,
            'tax' => (float) $transaction->tax_price,
            'discount' => (float) $transaction->discount_price,
            'total' => (float) $transaction->total_price,
            'cash_received' => $transaction->cash_received !== null ? (float) $transaction->cash_received : null,
            'change' => (float) $transaction->change_amount,
            'cashier_name' => $transaction->user?->name ?? '-',
            'customer_name' => $transaction->customer_name,
            'customer_phone' => $transaction->customer_phone,
            'created_at' => $transaction->created_at?->format('d M Y H:i'),
            'items' => $items,
            'snap_token' => $transaction->midtrans_snap_token,
        ];
    }
}
