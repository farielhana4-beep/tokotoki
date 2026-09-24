import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useBrand } from '@/lib/brand';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(amount);

const notifyError = (message) => window.dispatchEvent(new CustomEvent('app:toast', {
    detail: { tone: 'error', title: 'Gagal menambahkan', message },
}));

const firstErrorMessage = (errors) => {
    const values = Object.values(errors ?? {});
    return typeof values[0] === 'string' ? values[0] : 'Terjadi kesalahan. Silakan coba lagi.';
};

export default function ProductDetail({ product }) {
    const brand = useBrand();
    const [adding, setAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const maxQuantity = Math.max(product.stock ?? 0, 1);

    const decrease = () => setQuantity((value) => Math.max(1, value - 1));
    const increase = () => setQuantity((value) => Math.min(maxQuantity, value + 1));

    const addToCart = () => {
        if (adding || !product.in_stock) return;

        const chosen = Math.min(Math.max(quantity, 1), maxQuantity);
        setAdding(true);
        router.post(
            route('store.cart.store', product.id),
            { quantity: chosen },
            {
                preserveScroll: true,
                onFinish: () => setAdding(false),
                onError: (errors) => notifyError(firstErrorMessage(errors)),
            },
        );
    };

    return (
        <PublicLayout title={product.name}>
            <Head><meta name="description" content={product.description || `${product.name} dari ${brand.name}`} /></Head>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Link href={route('store.catalog')} className="text-sm font-semibold text-emerald-800 hover:text-amber-800">← Kembali ke katalog</Link>
                <section className="mt-6 grid overflow-hidden rounded-3xl border border-amber-900/10 bg-white shadow-sm lg:grid-cols-2">
                    <div className="aspect-square bg-amber-100/60 lg:aspect-auto"><img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /></div>
                    <div className="flex flex-col p-7 sm:p-10">
                        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{product.category}</span>
                        <h1 className="mt-5 break-words font-serif text-4xl font-bold leading-tight text-emerald-950 sm:text-5xl">{product.name}</h1>
                        <p className="mt-5 text-xl font-bold text-emerald-800">{formatCurrency(product.selling_price)}</p>
                        <div className={`mt-6 inline-flex w-fit rounded-lg px-3 py-2 text-sm font-semibold ${product.in_stock ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{product.in_stock ? `Tersedia · Stok ${product.stock}` : 'Stok sedang habis'}</div>
                        <div className="mt-8 border-t border-amber-900/10 pt-6"><h2 className="font-serif text-xl font-bold text-emerald-950">Tentang karya ini</h2><p className="mt-3 whitespace-pre-line leading-7 text-stone-600">{product.description || 'Deskripsi karya ini sedang disiapkan oleh perajin kami.'}</p></div>
                        <div className="mt-auto pt-10">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center rounded-xl border border-amber-900/15 bg-amber-50 p-1" role="group" aria-label="Pilih jumlah">
                                    <button type="button" onClick={decrease} disabled={!product.in_stock || adding || quantity <= 1} aria-label="Kurangi jumlah" className="flex h-11 w-11 items-center justify-center rounded-lg text-xl font-bold text-emerald-900 disabled:opacity-35">-</button>
                                    <span className="w-12 text-center text-base font-bold text-emerald-950" aria-live="polite" aria-label={`Jumlah ${quantity}`}>{quantity}</span>
                                    <button type="button" onClick={increase} disabled={!product.in_stock || adding || quantity >= maxQuantity} aria-label="Tambah jumlah" className="flex h-11 w-11 items-center justify-center rounded-lg text-xl font-bold text-emerald-900 disabled:opacity-35">+</button>
                                </div>
                                <p className="text-xs leading-5 text-stone-500">Stok tersedia: <span className="font-bold text-emerald-900">{product.stock}</span></p>
                            </div>
                            <button
                                type="button"
                                disabled={!product.in_stock || adding}
                                onClick={addToCart}
                                aria-busy={adding}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {adding ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                                        </svg>
                                        Menambahkan ke keranjang...
                                    </>
                                ) : product.in_stock ? 'Tambahkan ke keranjang' : 'Stok sedang habis'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
