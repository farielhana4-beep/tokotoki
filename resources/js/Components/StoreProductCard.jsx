import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { storeActionButton } from '@/lib/ui';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const notifyError = (message) => window.dispatchEvent(new CustomEvent('app:toast', {
    detail: { tone: 'error', title: 'Gagal menambahkan', message },
}));

const firstErrorMessage = (errors) => {
    const values = Object.values(errors ?? {});
    return typeof values[0] === 'string' ? values[0] : 'Terjadi kesalahan. Silakan coba lagi.';
};

function Spinner({ className = 'h-3.5 w-3.5' }) {
    return (
        <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
    );
}

export default function StoreProductCard({ product }) {
    const [adding, setAdding] = useState(false);

    const addToCart = () => {
        if (adding || !product.in_stock) return;

        setAdding(true);
        router.post(
            route('store.cart.store', product.id),
            { quantity: 1 },
            {
                preserveScroll: true,
                onFinish: () => setAdding(false),
                onError: (errors) => notifyError(firstErrorMessage(errors)),
            },
        );
    };

    return (
        <article className="group overflow-hidden rounded-2xl border border-amber-900/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-950/10">
            <Link href={route('store.products.show', product.id)} className="block aspect-[4/3] overflow-hidden bg-amber-100/60">
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
            </Link>
            <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">{product.category}</span>
                    <span className={`text-xs font-medium ${product.in_stock ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {adding ? 'Menambahkan...' : product.in_stock ? 'Tersedia' : 'Stok habis'}
                    </span>
                </div>
                <h2 className="font-serif text-xl font-bold text-emerald-950">{product.name}</h2>
                <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="font-semibold text-emerald-800">{formatCurrency(product.selling_price)}</p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={!product.in_stock || adding}
                            onClick={addToCart}
                            aria-busy={adding}
                            className={storeActionButton}
                        >
                            {adding ? <><Spinner />Menambahkan...</> : '+ Keranjang'}
                        </button>
                        <Link href={route('store.products.show', product.id)} className="text-sm font-semibold text-amber-800 underline decoration-amber-400 underline-offset-4 hover:text-emerald-800">Detail</Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
