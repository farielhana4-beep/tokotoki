import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const statusStyle = (status) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-800';
    if (status === 'pending') return 'bg-amber-100 text-amber-900';
    return 'bg-stone-100 text-stone-700';
};

const statusLabel = (status) => {
    if (status === 'paid') return 'Sudah dibayar';
    if (status === 'pending') return 'Menunggu pembayaran · Bayar saat pengambilan';
    return status;
};

export default function OrderDetail({ order }) {
    return (
        <PublicLayout title={`Pesanan ${order.invoice_number}`}>
            <section className="bg-emerald-950 px-4 py-12 text-amber-50 sm:px-6 sm:py-14 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Detail pesanan</p>
                    <h1 className="mt-3 break-all font-mono text-2xl font-bold sm:text-3xl">{order.invoice_number}</h1>
                    <p className="mt-2 text-sm text-amber-50/70">{order.created_at}</p>
                </div>
            </section>
            <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
                <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-serif text-2xl font-bold text-emerald-950">Barang dibeli</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(order.payment_status)}`}>{statusLabel(order.payment_status)}</span>
                    </div>
                    <div className="mt-5 space-y-3">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-sm">
                                <span className="min-w-0 flex-1 break-words text-stone-700">{item.name} <span className="text-stone-400">× {item.quantity}</span></span>
                                <span className="shrink-0 font-semibold text-emerald-900">{formatCurrency(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 space-y-2 border-t border-amber-900/10 pt-4 text-sm">
                        <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                        <div className="flex justify-between text-stone-600"><span>PPN 11%</span><span>{formatCurrency(order.tax)}</span></div>
                        <div className="flex justify-between font-serif text-xl font-bold text-emerald-950"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
                    </div>
                </div>
                <aside className="h-fit rounded-2xl border border-amber-900/10 bg-amber-50 p-6">
                    <h2 className="font-serif text-xl font-bold text-emerald-950">Data pemesan</h2>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div><dt className="font-semibold text-stone-500">Nama</dt><dd className="mt-0.5 break-words font-bold text-emerald-950">{order.customer_name}</dd></div>
                        <div><dt className="font-semibold text-stone-500">Telepon</dt><dd className="mt-0.5 break-words font-bold text-emerald-950">{order.customer_phone}</dd></div>
                        <div><dt className="font-semibold text-stone-500">Alamat / catatan</dt><dd className="mt-0.5 break-words text-stone-700">{order.customer_address}</dd></div>
                    </dl>
                    <a href={route('store.orders.receipt', order.id)} download className="mt-6 block w-full rounded-xl bg-emerald-800 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700">Cetak Struk (PDF)</a>
                    <Link href={route('store.orders.index')} className="mt-4 block text-center text-sm font-bold text-emerald-800 underline decoration-amber-500 underline-offset-4">← Kembali ke Pesanan Saya</Link>
                </aside>
            </section>
        </PublicLayout>
    );
}
