import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import StoreProductCard from '@/Components/StoreProductCard';
import { useBrand } from '@/lib/brand';

export default function Catalog({ products, categories, filters, categoryCounts = {} }) {
    const brand = useBrand();
    const [search, setSearch] = useState(filters.search ?? '');
    const applyFilters = (next = {}) => router.get(route('store.catalog'), { search, category: filters.category ?? '', ...next }, { preserveScroll: true, preserveState: true, replace: true });
    const reset = () => { setSearch(''); router.get(route('store.catalog'), {}, { preserveScroll: true, replace: true }); };

    return (
        <PublicLayout title="Katalog">
            <section className="bg-emerald-950 px-4 py-12 text-amber-50 sm:px-6 sm:py-14 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Katalog {brand.name}</p><h1 className="mt-3 max-w-3xl break-words font-serif text-4xl font-bold sm:text-5xl">Temukan Kerajinan Favoritmu</h1><p className="mt-4 max-w-2xl leading-7 text-amber-50/70">Jelajahi koleksi {brand.name} berdasarkan kategori dan temukan berbagai produk kerajinan untuk dekorasi, kebutuhan rumah, aksesoris, dan souvenir.</p></div></section>
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <form onSubmit={(event) => { event.preventDefault(); applyFilters(); }} className="rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 md:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4"><svg className="h-5 w-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="6" /><path d="m20 20-4-4" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full border-0 bg-transparent px-0 py-3 text-base text-stone-800 placeholder:text-stone-400 focus:ring-0 sm:text-sm" placeholder="Cari karya favorit Anda..." /></label><button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">Cari</button>{(filters.search || filters.category) ? <button type="button" onClick={reset} className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">Reset</button> : null}</div>
                    <div id="kategori" className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => applyFilters({ category: '' })} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!filters.category ? 'bg-amber-400 text-emerald-950' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'}`}>Semua</button>{categories.map((category) => <button type="button" key={category} onClick={() => applyFilters({ category })} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filters.category === category ? 'bg-amber-400 text-emerald-950' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'}`}>{category}{typeof categoryCounts[category] === 'number' ? ` (${categoryCounts[category]})` : ''}</button>)}</div>
                </form>
                <div className="mt-8 flex items-center justify-between gap-4"><p className="text-sm text-stone-600">Menampilkan <span className="font-bold text-emerald-900">{products.total}</span> karya{filters.category ? ` di ${filters.category}` : ''}{filters.search ? ` untuk “${filters.search}”` : ''}.</p></div>
                {products.data.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.data.map((product) => <StoreProductCard key={product.id} product={product} />)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-amber-800/30 bg-amber-50/60 px-6 py-16 text-center"><p className="font-serif text-2xl font-bold text-emerald-950">Belum ada karya yang sesuai</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p><button type="button" onClick={reset} className="mt-6 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Lihat semua koleksi</button></div>}
                {products.links?.length > 3 ? <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">{products.links.map((link, index) => <Link key={`${link.label}-${index}`} href={link.url ?? '#'} preserveScroll className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-emerald-800 text-white' : link.url ? 'border border-stone-200 bg-white text-stone-700 hover:bg-amber-50' : 'cursor-not-allowed text-stone-400'}`} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav> : null}
            </section>
        </PublicLayout>
    );
}
