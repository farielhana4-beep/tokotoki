import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ReceiptModal from '../POS/Partials/ReceiptModal';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function openPrintableReceipt(receipt) {
    const receiptWindow = window.open('', '_blank', 'width=420,height=720');

    if (!receiptWindow) {
        return;
    }

    const formatMoney = (value) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(value ?? 0));
    const escapeHtml = (value) =>
        String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');

    const items = Array.isArray(receipt?.items) ? receipt.items : [];

    receiptWindow.document.write(`
        <html>
            <head>
                <title>${receipt?.invoice_number ?? 'Receipt'}</title>
                <meta charset="utf-8" />
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #fff; color: #111827; }
                    .wrap { max-width: 320px; margin: 0 auto; }
                    .line { border-top: 1px dashed #d1d5db; margin: 12px 0; }
                    .row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; margin: 6px 0; }
                    .muted { color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="wrap">
                    <h1 style="font-size:18px;margin:0;">${escapeHtml(receipt?.invoice_number ?? '-')}</h1>
                    <p class="muted">${escapeHtml(receipt?.created_at ?? '-')}</p>
                    <div class="line"></div>
                    <p style="font-size:13px;margin:0;">Cashier: ${escapeHtml(receipt?.cashier_name ?? '-')}</p>
                    ${receipt?.source === 'store' ? `<p style="font-size:13px;margin:4px 0 0 0;">Source: Store</p><p style="font-size:13px;margin:4px 0 0 0;">Customer: ${escapeHtml(receipt?.customer_name ?? '-')}</p><p style="font-size:13px;margin:4px 0 0 0;">WhatsApp: ${escapeHtml(receipt?.customer_phone ?? '-')}</p>` : ''}
                    <p style="font-size:13px;margin:4px 0 0 0;">Payment: ${escapeHtml((receipt?.payment_method ?? '-').toUpperCase())}</p>
                    <p style="font-size:13px;margin:4px 0 0 0;">Status: ${escapeHtml((receipt?.payment_status ?? '-').toUpperCase())}</p>
                    <div class="line"></div>
                    ${items.map((item) => `
                        <div class="row"><span>${escapeHtml(item.name ?? '-')}</span><span>${escapeHtml(`${item.quantity} x ${formatMoney(item.price)}`)}</span></div>
                        <div class="row"><span class="muted">${escapeHtml(item.barcode ?? '-')}</span><span>${escapeHtml(formatMoney(item.subtotal))}</span></div>
                    `).join('')}
                    <div class="line"></div>
                    <div class="row"><span>Subtotal</span><span>${escapeHtml(formatMoney(receipt?.subtotal))}</span></div>
                    <div class="row"><span>Tax</span><span>${escapeHtml(formatMoney(receipt?.tax))}</span></div>
                    <div class="row"><span>Discount</span><span>${escapeHtml(formatMoney(receipt?.discount))}</span></div>
                    <div class="row"><span>Total</span><span>${escapeHtml(formatMoney(receipt?.total))}</span></div>
                    <div class="row"><span>Cash</span><span>${receipt?.cash_received !== null && receipt?.cash_received !== undefined ? escapeHtml(formatMoney(receipt.cash_received)) : '-'}</span></div>
                    <div class="row"><span>Change</span><span>${escapeHtml(formatMoney(receipt?.change))}</span></div>
                </div>
            </body>
        </html>
    `);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
}

function Badge({ children, tone = 'slate' }) {
    const tones = {
        slate: 'border-white/10 bg-white/5 text-slate-300',
        cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
        emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
        amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
        rose: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
        violet: 'border-violet-400/20 bg-violet-400/10 text-violet-200',
    };

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${tones[tone]}`}>
            {children}
        </span>
    );
}

function StatCard({ label, value, note, tone }) {
    return (
        <div className="rounded-[28px] border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${tone}`} />
            <div className="mt-4 text-sm text-slate-400">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
            {note ? <div className="mt-2 text-xs text-slate-500">{note}</div> : null}
        </div>
    );
}

function Pagination({ links }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {safeArray(links).map((link, index) => {
                const commonClasses = 'rounded-xl border px-3 py-2 text-sm transition';
                const activeClasses = link.active
                    ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white';
                const disabledClasses = !link.url ? 'pointer-events-none opacity-40' : '';

                return (
                    <button
                        key={`${link.label}-${index}`}
                        type="button"
                        disabled={!link.url}
                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                        className={`${commonClasses} ${activeClasses} ${disabledClasses}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

export default function Index({
    transactions,
    filters,
    summary,
    statusOptions,
    paymentMethodOptions,
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const records = safeArray(transactions?.data);
    const links = safeArray(transactions?.links);
    const from = Number(transactions?.from ?? 0);
    const to = Number(transactions?.to ?? 0);
    const total = Number(transactions?.total ?? 0);

    const statsCards = useMemo(
        () => [
            {
                label: 'Total Transactions',
                value: summary.total ?? 0,
                note: 'Real sales only',
                tone: 'from-cyan-400 to-blue-500',
            },
            {
                label: 'Paid Sales',
                value: summary.paid ?? 0,
                note: 'Settled transactions',
                tone: 'from-emerald-400 to-teal-500',
            },
            {
                label: 'Pending Orders',
                value: summary.pending ?? 0,
                note: 'Not yet settled',
                tone: 'from-amber-400 to-orange-500',
            },
            {
                label: 'Revenue',
                value: formatCurrency(summary.revenue ?? 0),
                note: 'Paid sales in filter',
                tone: 'from-violet-400 to-fuchsia-500',
            },
        ],
        [summary],
    );

    const applyFilters = (event) => {
        event?.preventDefault?.();

        router.get(
            route('admin.transactions.index'),
            {
                search,
                status,
                payment_method: paymentMethod,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const openReceipt = (transaction) => {
        setReceipt(transaction);
        setReceiptOpen(true);
    };

    const statusTone = (value) => {
        switch (value) {
            case 'paid':
                return 'emerald';
            case 'pending':
                return 'amber';
            case 'expired':
                return 'rose';
            case 'canceled':
            case 'failed':
                return 'rose';
            default:
                return 'slate';
        }
    };

    const paymentTone = (value) => {
        switch (value) {
            case 'cash':
                return 'emerald';
            case 'qris':
                return 'violet';
            default:
                return 'slate';
        }
    };

    return (
        <AuthenticatedLayout
            title="Transactions"
            header={
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge tone="cyan">Sales Ledger</Badge>
                            <Badge tone="slate">{total} records</Badge>
                        </div>
                        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                            Transaction history, receipt reopen, and payment status tracking.
                        </h2>
                        <p className="max-w-3xl text-sm leading-6 text-slate-300">
                            Search by invoice or cashier, filter by status and payment method, then reopen any receipt for review or printing.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => router.reload({ preserveScroll: true })}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Transactions" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statsCards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </section>

                <section className="rounded-[32px] border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                    <form
                        onSubmit={applyFilters}
                        className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_0.7fr_auto]"
                    >
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Search
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Invoice number or cashier name"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:ring-cyan-400"
                            >
                                {safeArray(statusOptions).map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Payment Method
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(event) => setPaymentMethod(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:ring-cyan-400"
                            >
                                {safeArray(paymentMethodOptions).map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => setDateFrom(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:ring-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:ring-cyan-400"
                            />
                        </div>

                        <div className="flex items-end gap-3">
                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('all');
                                    setPaymentMethod('all');
                                    setDateFrom('');
                                    setDateTo('');
                                    router.get(route('admin.transactions.index'), {}, { preserveScroll: true, replace: true });
                                }}
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-[32px] border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Transaction list
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Click any row to reopen the stored receipt and print it again.
                            </p>
                        </div>
                        <div className="text-sm text-slate-400">
                            Showing {from} to {to} of {total}
                        </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10">
                        {records.length ? (
                            <div className="divide-y divide-white/10">
                                {records.map((transaction) => (
                                    <button
                                        key={transaction.id}
                                        type="button"
                                        onClick={() => openReceipt(transaction)}
                                        className="block w-full bg-slate-950/35 px-4 py-4 text-left transition hover:bg-white/[0.04]"
                                    >
                                        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.9fr_auto] lg:items-center">
                                            <div>
                                                <div className="text-sm font-semibold text-white">
                                                    {transaction.invoice_number}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-400">
                                                    {transaction.source === 'store'
                                                        ? <>Store · {transaction.customer_name ?? '-'} · {transaction.customer_phone ?? '-'}</>
                                                        : <>{transaction.cashier_name} · {transaction.created_at}</>}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge tone={paymentTone(transaction.payment_method)}>
                                                    {transaction.payment_method}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge tone={statusTone(transaction.payment_status)}>
                                                    {transaction.payment_status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm font-semibold text-cyan-300">
                                                {formatCurrency(transaction.total)}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {transaction.items?.length ?? 0} items
                                            </div>
                                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                                                Reopen
                                            </div>
                                            {transaction.payment_status === 'pending' ? (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        router.patch(route('admin.transactions.status', transaction.id), { payment_status: 'paid' }, { preserveScroll: true });
                                                    }}
                                                    className="mt-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
                                                >
                                                    Tandai Lunas
                                                </button>
                                            ) : null}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-16 text-center text-sm text-slate-400">
                                No transactions match the current filters.
                            </div>
                        )}
                    </div>

                    <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <Pagination links={links} />
                    </div>
                </section>
            </div>

            <ReceiptModal
                show={receiptOpen}
                receipt={receipt}
                onPrint={() => openPrintableReceipt(receipt)}
                onClose={() => setReceiptOpen(false)}
                pdfUrl={receipt?.id ? route('admin.transactions.receipt', receipt.id) : null}
                onMarkPaid={receipt?.id && receipt?.payment_status === 'pending' ? () => router.patch(route('admin.transactions.status', receipt.id), { payment_status: 'paid' }, { preserveScroll: true }) : null}
            />
        </AuthenticatedLayout>
    );
}
