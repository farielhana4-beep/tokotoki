import Modal from '@/Components/Modal';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function normalizeMoney(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
}

export default function ReceiptModal({ show, receipt, onClose, onPrint, pdfUrl = null, onMarkPaid = null }) {
    if (!receipt) {
        return null;
    }

    const items = receipt.items ?? [];

    return (
        <Modal show={show} maxWidth="2xl" closeable onClose={onClose}>
            <div className="bg-slate-950 text-white">
                <div className="border-b border-white/10 px-6 py-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                        Receipt Preview
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">
                        {receipt.invoice_number ?? 'Draft receipt'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                        {receipt.created_at ?? 'Pending transaction details'}
                    </p>
                </div>

                <div className="space-y-4 px-6 py-6">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                    Cashier
                                </div>
                                <div className="mt-1 font-medium text-white">
                                    {receipt.cashier_name ?? '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                    Payment
                                </div>
                                <div className="mt-1 font-medium text-white">
                                    {(receipt.payment_method ?? '').toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Transaction No.
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                                {receipt.invoice_number ?? '-'}
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Subtotal
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatCurrency(normalizeMoney(receipt.subtotal))}
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Tax
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatCurrency(normalizeMoney(receipt.tax))}
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Discount
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatCurrency(normalizeMoney(receipt.discount))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            Items
                        </div>
                        <div className="mt-3 space-y-3">
                            {items.map((item) => (
                                <div
                                    key={`${item.product_id}-${item.barcode}`}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium text-white">
                                            {item.name}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-400">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold text-cyan-300">
                                        {formatCurrency(item.subtotal)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Total
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatCurrency(receipt.total)}
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Cash
                            </div>
                            <div className="mt-2 text-lg font-semibold text-white">
                                {receipt.cash_received
                                    ? formatCurrency(receipt.cash_received)
                                    : '-'}
                            </div>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Change
                            </div>
                            <div className="mt-2 text-lg font-semibold text-emerald-300">
                                {formatCurrency(receipt.change)}
                            </div>
                        </div>
                    </div>

                    {receipt.payment_status ? (
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Payment status
                            </div>
                            <div className="mt-2 font-semibold text-white">
                                {String(receipt.payment_status).toUpperCase()}
                            </div>
                        </div>
                    ) : null}

                    {receipt.snap_token ? (
                        <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50">
                            <div className="font-semibold">Midtrans Snap token detected</div>
                            <p className="mt-2 text-cyan-50/80">
                                This transaction can be handed off to Midtrans for live QRIS payment and status updates.
                            </p>
                        </div>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Close
                        </button>
                        {pdfUrl ? (
                            <a
                                href={pdfUrl}
                                download
                                className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                            >
                                Cetak Struk (PDF)
                            </a>
                        ) : null}
                        {onMarkPaid ? (
                            <button
                                type="button"
                                onClick={onMarkPaid}
                                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                            >
                                Tandai Lunas
                            </button>
                        ) : null}
                        {onPrint ? (
                            <button
                                type="button"
                                onClick={onPrint}
                                className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                            >
                                Print Receipt
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
