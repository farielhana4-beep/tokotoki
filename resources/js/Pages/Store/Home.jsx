import { Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import StoreProductCard from '@/Components/StoreProductCard';
import { useBrand } from '@/lib/brand';

const categoryIcons = { Dekorasi: '✺', Aksesoris: '✧', 'Perlengkapan Rumah': '⌂', Souvenir: '❋' };

const categoryDescriptions = {
    Dekorasi: 'Kerajinan dekoratif untuk mempercantik ruang dan sudut rumah.',
    Aksesoris: 'Produk aksesoris dengan sentuhan kerajinan yang unik.',
    'Perlengkapan Rumah': 'Kerajinan yang dapat digunakan sebagai pelengkap kebutuhan rumah.',
    Souvenir: 'Pilihan kerajinan kecil yang cocok sebagai buah tangan atau hadiah.',
};

export default function Home({ categories, featuredProducts, categoryCounts = {} }) {
    const brand = useBrand();

    return (
        <PublicLayout title={brand.name}>
            <section className="relative isolate overflow-hidden bg-emerald-950 px-4 py-14 text-amber-50 sm:px-6 sm:py-20 lg:px-8">
                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(251,191,36,.35)_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />
                <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border-[40px] border-amber-400/15" aria-hidden="true" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-10 sm:gap-12 lg:grid-cols-[1.15fr_.85fr]">
                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <img
                                src={brand.logoUrl}
                                alt={brand.logoAlt}
                                className="h-14 w-14 shrink-0 rounded-2xl bg-white object-contain p-1 shadow-lg sm:h-16 sm:w-16"
                                loading="eager"
                            />
                            <div className="min-w-0">
                                <p className="truncate font-serif text-2xl font-bold sm:text-3xl">{brand.name}</p>
                                <p className="truncate text-xs font-bold uppercase tracking-[0.22em] text-amber-200">{brand.shortDescription}</p>
                            </div>
                        </div>
                        <h1 className="max-w-3xl break-words font-serif text-3xl font-bold leading-[1.12] sm:text-5xl lg:text-6xl">{brand.tagline}</h1>
                        <p className="mt-6 max-w-xl text-base leading-8 text-amber-50/75 sm:text-lg">{brand.description}</p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Link href={route('store.catalog')} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-400 px-6 py-3.5 text-center text-sm font-bold text-emerald-950 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">Lihat Katalog</Link>
                            {brand.whatsappUrl ? <a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-100/35 px-6 py-3.5 text-center text-sm font-bold text-amber-50 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">Hubungi Kami</a> : null}
                        </div>
                    </div>
                    <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-amber-300/20 bg-amber-50/10 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                        <div className="aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-[linear-gradient(145deg,#e8c78e,#b97841)] p-8">
                            <div className="flex h-full flex-col items-center justify-center gap-5 rounded-[1rem] border border-amber-950/20 p-6 text-center text-emerald-950">
                                <img src={brand.logoUrl} alt={brand.logoAlt} className="h-28 w-28 rounded-3xl bg-white object-contain p-2 shadow-md sm:h-32 sm:w-32" loading="eager" />
                                <div><p className="break-words font-serif text-4xl font-bold">{brand.name}</p><p className="mt-3 text-sm font-medium">{brand.tagline}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="kategori" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Temukan yang Anda sukai</p><h2 className="mt-3 font-serif text-3xl font-bold text-emerald-950 sm:text-4xl">Jelajahi Koleksi</h2><p className="mt-3 leading-7 text-stone-600">Temukan berbagai produk kerajinan {brand.name} berdasarkan kategori yang sesuai dengan kebutuhanmu.</p></div>
                <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((category) => (
                        <Link key={category} href={route('store.catalog', { category })} className="group flex min-h-44 flex-col rounded-2xl border border-amber-900/10 bg-amber-50 p-6 transition hover:border-amber-500/40 hover:bg-amber-100">
                            <span className="text-3xl text-emerald-800" aria-hidden="true">{categoryIcons[category] ?? '✦'}</span>
                            <h3 className="mt-5 font-serif text-2xl font-bold text-emerald-950">{category}{typeof categoryCounts[category] === 'number' ? <span className="ml-2 align-middle text-sm font-bold text-amber-700">({categoryCounts[category]})</span> : null}</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">{categoryDescriptions[category] ?? ''}</p>
                            <span className="mt-auto block pt-3 text-sm font-semibold text-amber-800 group-hover:text-emerald-800">Lihat koleksi →</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="border-y border-amber-900/10 bg-amber-50/70 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Pilihan terbaru</p><h2 className="mt-3 font-serif text-3xl font-bold text-emerald-950 sm:text-4xl">Dibuat untuk dinikmati</h2></div><Link href={route('store.catalog')} className="text-sm font-bold text-emerald-800 underline decoration-amber-500 underline-offset-4">Semua koleksi</Link></div>
                    {featuredProducts.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product) => <StoreProductCard key={product.id} product={product} />)}</div> : <div className="mt-9 rounded-2xl border border-dashed border-amber-800/25 bg-white/70 p-10 text-center"><p className="font-serif text-2xl font-bold text-emerald-950">Koleksi sedang disiapkan</p><p className="mt-2 text-sm text-stone-600">Produk kerajinan pilihan akan segera hadir di sini.</p></div>}
                </div>
            </section>
        </PublicLayout>
    );
}
