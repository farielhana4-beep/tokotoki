import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useBrand } from '@/lib/brand';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const statusStyle = (status) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-800';
    if (status === 'pending') return 'bg-amber-100 text-amber-900';
    return 'bg-stone-100 text-stone-700';
};

const statusLabel = (status) => {
    if (status === 'paid') return 'Sudah dibayar';
    if (status === 'pending') return 'Menunggu pembayaran';
    return status;
};

export default function Orders({ orders }) {
    const brand = useBrand();
    return (
        <PublicLayout title="Pesanan Saya">
            <section className="bg-emerald-950 px-4 py-12 text-amber-50 sm:px-6 sm:py-14 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Riwayat belanja</p>
                    <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Pesanan Saya</h1>
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {orders.data.length ? (
                    <div className="space-y-4">
                        {orders.data.map((order) => (
                            <Link key={order.id} href={route('store.orders.show', order.id)} className="block rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="break-all font-mono text-sm font-bold text-emerald-950">{order.invoice_number}</p>
                                        <p className="mt-1 text-xs text-stone-500">{order.created_at} · {order.item_count} barang</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(order.payment_status)}`}>{statusLabel(order.payment_status)}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-amber-900/10 pt-4">
                                    <span className="text-sm text-stone-600">Total</span>
                                    <span className="font-serif text-lg font-bold text-emerald-950">{formatCurrency(order.total)}</span>
                                </div>
                            </Link>
                        ))}
                        {orders.links?.length > 3 ? (
                            <nav className="flex flex-wrap justify-center gap-2 pt-4" aria-label="Pagination">
                                {orders.links.map((link, index) => (
                                    <Link key={`${link.label}-${index}`} href={link.url ?? '#'} preserveScroll className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-emerald-800 text-white' : link.url ? 'border border-stone-200 bg-white text-stone-700 hover:bg-amber-50' : 'cursor-not-allowed text-stone-400'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </nav>
                        ) : null}
                    </div>
                ) : (
                    <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-amber-800/30 bg-amber-50/60 px-6 py-16 text-center">
                        <h2 className="font-serif text-3xl font-bold text-emerald-950">Belum ada pesanan</h2>
                        <p className="mt-3 text-sm leading-6 text-stone-600">Pesanan yang Anda buat di {brand.name} akan muncul di sini.</p>
                        <Link href={route('store.catalog')} className="mt-7 inline-flex rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Mulai belanja</Link>
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
