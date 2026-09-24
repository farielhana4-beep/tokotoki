<?php

namespace App\Services\Report;

use App\Models\Transaction;
use App\Services\Settings\SettingsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionReceiptService
{
    public function __construct(private readonly SettingsService $settings) {}

    /**
     * Build a receipt payload from trusted database values only.
     */
    public function payload(Transaction $transaction): array
    {
        $transaction->loadMissing(['details.product:id,barcode,name', 'user:id,name']);
        $branding = $this->settings->frontend()['branding'];

        $items = $transaction->details->map(fn ($detail) => [
            'name' => $detail->product?->name ?? 'Produk',
            'barcode' => $detail->product?->barcode,
            'quantity' => (int) $detail->quantity,
            'price' => (float) $detail->price,
            'subtotal' => (float) $detail->price * (int) $detail->quantity,
        ])->values()->all();

        return [
            'store_name' => $branding['app_name'] ?? config('app.name', 'TOKOTOKI'),
            'invoice_number' => $transaction->invoice_number,
            'created_at' => optional($transaction->created_at)?->format('d M Y H:i') ?? '-',
            'cashier_name' => $transaction->user?->name,
            'customer_name' => $transaction->customer_name,
            'customer_phone' => $transaction->customer_phone,
            'customer_address' => $transaction->customer_address,
            'source' => $transaction->source,
            'payment_method' => $transaction->payment_method->value,
            'payment_status' => $transaction->payment_status->value,
            'items' => $items,
            'subtotal' => (float) $transaction->subtotal_price,
            'tax' => (float) $transaction->tax_price,
            'discount' => (float) $transaction->discount_price,
            'total' => (float) $transaction->total_price,
            'cash_received' => $transaction->cash_received !== null ? (float) $transaction->cash_received : null,
            'change' => (float) $transaction->change_amount,
            'bank_name' => $branding['store_bank_name'] ?? '',
            'bank_number' => $branding['store_bank_number'] ?? '',
            'bank_holder' => $branding['store_bank_holder'] ?? '',
            'footer_text' => (string) $this->settings->get(
                'receipt_footer_text',
                'Terima kasih telah berbelanja.'
            ),
        ];
    }

    public function download(Transaction $transaction): StreamedResponse
    {
        $receipt = $this->payload($transaction);

        // 80mm thermal receipt width; fixed height fits typical receipts.
        $pdf = Pdf::loadView('reports.receipt', ['receipt' => $receipt])
            ->setPaper([0, 0, 226.77, 700]);

        $filename = sprintf('struk-%s.pdf', $transaction->invoice_number);

        return response()->streamDownload(
            fn () => print($pdf->output()),
            $filename,
            ['Content-Type' => 'application/pdf'],
        );
    }
}
