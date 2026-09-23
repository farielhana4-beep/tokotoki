import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const notifyError = (message) => window.dispatchEvent(new CustomEvent('app:toast', {
    detail: { tone: 'error', title: 'Keranjang gagal diperbarui', message },
}));

const firstErrorMessage = (errors) => {
    const values = Object.values(errors ?? {});
    return typeof values[0] === 'string' ? values[0] : 'Terjadi kesalahan. Silakan coba lagi.';
};

function MiniSpinner({ className = 'h-4 w-4' }) {
    return (
        <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
    );
}

function CartItem({ item }) {
    const [quantity, setQuantity] = useState(String(item.quantity));
    const [pending, setPending] = useState(null);
    const product = item.product;
    const busy = pending !== null;

    // Keep the editable input in sync after the server confirms a new quantity.
    useEffect(() => {
        setQuantity(String(item.quantity));
    }, [item.quantity]);

    const patchQuantity = (parsed, action) => {
        if (busy || !product) return;

        if (!Number.isInteger(parsed) || parsed < 1) {
            setQuantity(String(item.quantity));
            notifyError('Jumlah minimal 1. Sesuaikan angka lalu coba lagi.');
            return;
        }

        if (parsed > product.stock) {
            setQuantity(String(item.quantity));
            notifyError(`Stok terbaru hanya ${product.stock}. Sesuaikan jumlah pesanan Anda.`);
            return;
        }

        if (parsed === item.quantity) return;

        setPending(action);
        router.patch(route('store.cart.update', product.id), { quantity: parsed }, {
            preserveScroll: true,
            onFinish: () => setPending(null),
            onError: (errors) => {
                setQuantity(String(item.quantity));
                notifyError(firstErrorMessage(errors));
            },
        });
    };

    const remove = () => {
        if (busy) return;

        const id = product?.id ?? item.product_id;
        setPending('remove');
        router.delete(route('store.cart.destroy', id), {
            preserveScroll: true,
            onFinish: () => setPending(null),
            onError: (errors) => notifyError(firstErrorMessage(errors)),
        });
    };

    const commitInput = () => patchQuantity(Number(quantity), 'input');

    if (!product) {
        return (
            <article className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <p className="font-semibold text-rose-800">Produk sudah tidak tersedia.</p>
                <button
                    type="button"
                    onClick={remove}
                    disabled={busy}
                    aria-busy={busy}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-rose-800 underline disabled:opacity-60"
                >
                    {pending === 'remove' ? <><MiniSpinner className="h-3.5 w-3.5" />Menghapus...</> : 'Hapus dari keranjang'}
                </button>
            </article>
        );
    }

    const canDecrease = item.quantity > 1 && !busy;
    const canIncrease = item.available && item.quantity < product.stock && !busy;

    return (
        <article className={`rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm transition sm:p-5 ${busy ? 'opacity-90' : ''}`} aria-busy={busy}>
            <div className="flex flex-col gap-4 sm:flex-row">
                <img src={product.image_url} alt={product.name} className="h-28 w-full rounded-xl bg-amber-50 object-cover sm:w-32" loading="lazy" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold text-amber-800">{product.category}</p>
                            <h2 className="mt-1 font-serif text-xl font-bold text-emerald-950">{product.name}</h2>
                            <p className="mt-2 font-semibold text-emerald-800">{formatCurrency(product.selling_price)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={remove}
                            disabled={busy}
                            aria-busy={pending === 'remove'}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 disabled:opacity-60"
                        >
                            {pending === 'remove' ? <><MiniSpinner className="h-3.5 w-3.5" />Menghapus...</> : 'Hapus'}
                        </button>
                    </div>
                    {item.message ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{item.message}</p> : null}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-xl border border-amber-900/15 bg-amber-50 p-1">
                            <button
                                type="button"
                                onClick={() => patchQuantity(item.quantity - 1, 'dec')}
                                disabled={!canDecrease}
                                aria-label={`Kurangi jumlah ${product.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-emerald-900 disabled:opacity-35"
                            >
                                {pending === 'dec' ? <MiniSpinner /> : '-'}
                            </button>
                            <input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={quantity}
                                disabled={busy}
                                onChange={(event) => setQuantity(event.target.value)}
                                onBlur={commitInput}
                                onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
                                className="w-14 border-0 bg-transparent p-0 text-center text-base font-bold text-emerald-950 focus:ring-0 disabled:opacity-60 sm:text-sm"
                                aria-label={`Jumlah ${product.name}`}
                            />
                            <button
                                type="button"
                                onClick={() => patchQuantity(item.quantity + 1, 'inc')}
                                disabled={!canIncrease}
                                aria-label={`Tambah jumlah ${product.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold text-emerald-900 disabled:opacity-35"
                            >
                                {pending === 'inc' ? <MiniSpinner /> : '+'}
                            </button>
                        </div>
                        <p className="font-serif text-lg font-bold text-emerald-950">{formatCurrency(item.line_total)}</p>
                    </div>
                    {busy && pending !== 'remove' ? (
                        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800" role="status">
                            <MiniSpinner className="h-3.5 w-3.5" />Memperbarui keranjang...
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

export default function Cart({ cart }) {
    return <PublicLayout title="Keranjang Belanja"><section className="bg-emerald-950 px-4 py-12 text-amber-50 sm:px-6 sm:py-14 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Pilihan Anda</p><h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Keranjang belanja</h1></div></section><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{cart.items.length ? <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]"><div className="space-y-4">{cart.items.map((item, index) => <CartItem key={item.product?.id ?? `unavailable-${index}`} item={item} />)}</div><aside className="h-fit rounded-2xl border border-amber-900/10 bg-amber-50 p-6 lg:sticky lg:top-24"><h2 className="font-serif text-2xl font-bold text-emerald-950">Ringkasan pesanan</h2><div className="mt-6 flex items-center justify-between border-t border-amber-900/10 pt-5"><span className="text-stone-600">Subtotal</span><span className="font-serif text-xl font-bold text-emerald-950">{formatCurrency(cart.subtotal)}</span></div>{cart.has_availability_issue ? <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm leading-6 text-rose-700">Periksa kembali item yang ditandai sebelum checkout.</p> : <Link href={route('store.checkout.create')} className="mt-6 block rounded-xl bg-emerald-800 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-emerald-700">Lanjut ke checkout</Link>}<Link href={route('store.catalog')} className="mt-5 block text-center text-sm font-bold text-emerald-800 underline decoration-amber-500 underline-offset-4">Lanjut belanja</Link></aside></div> : <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-amber-800/30 bg-amber-50/60 px-6 py-16 text-center"><div className="text-4xl text-emerald-800">*</div><h2 className="mt-4 font-serif text-3xl font-bold text-emerald-950">Keranjang Anda masih kosong</h2><p className="mt-3 text-sm leading-6 text-stone-600">Mari temukan karya tangan Nusantara yang paling sesuai untuk Anda.</p><Link href={route('store.catalog')} className="mt-7 inline-flex rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Jelajahi katalog</Link></div>}</section></PublicLayout>;
}
