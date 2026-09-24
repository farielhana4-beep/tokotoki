<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
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
        $dateFrom = trim((string) $request->string('date_from'));
        $dateTo = trim((string) $request->string('date_to'));

        $filteredQuery = function () use ($search, $status, $paymentMethod, $dateFrom, $dateTo) {
            return Transaction::query()
                ->where('invoice_number', 'not like', 'INV-DEMO-%')
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($inner) use ($search) {
                        $inner->where('invoice_number', 'like', "%{$search}%")
                            ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
                    });
                })
                ->when($status !== 'all', fn ($query) => $query->where('payment_status', $status))
                ->when($paymentMethod !== 'all', fn ($query) => $query->where('payment_method', $paymentMethod))
                // whereDate keeps the whole calendar day, so transactions at
                // any hour of the end date stay included.
                ->when($dateFrom !== '', fn ($query) => $query->whereDate('created_at', '>=', $dateFrom))
                ->when($dateTo !== '', fn ($query) => $query->whereDate('created_at', '<=', $dateTo));
        };

        $transactions = $filteredQuery()
            ->with([
                'user:id,name',
                'details.product:id,barcode,name',
            ])
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Transaction $transaction) => $this->mapTransaction($transaction));

        // Summary follows the same filters. Revenue counts paid transactions
        // only, matching the business rule used across reports.
        $summary = [
            'total' => $filteredQuery()->count(),
            'paid' => $filteredQuery()
                ->where('payment_status', PaymentStatus::Paid->value)
                ->count(),
            'pending' => $filteredQuery()
                ->where('payment_status', PaymentStatus::Pending->value)
                ->count(),
            'revenue' => (float) $filteredQuery()
                ->where('payment_status', PaymentStatus::Paid->value)
                ->sum('total_price'),
        ];

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
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

    public function updateStatus(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'payment_status' => ['required', 'in:paid,pending'],
        ]);

        $transaction->forceFill([
            'payment_status' => PaymentStatus::from($validated['payment_status']),
        ])->save();

        return back()->with('success', "Transaksi {$transaction->invoice_number} ditandai sebagai {$transaction->payment_status->label()}.");
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
