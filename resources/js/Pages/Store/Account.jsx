import { Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useBrand } from '@/lib/brand';

export default function Account({ account }) {
    const brand = useBrand();
    const logout = () => router.post(route('logout'));

    return (
        <PublicLayout title="Akun Saya">
            <section className="bg-emerald-950 px-4 py-12 text-amber-50 sm:px-6 sm:py-14 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Akun Anda</p>
                    <h1 className="mt-3 break-words font-serif text-4xl font-bold sm:text-5xl">Halo, {account.name}</h1>
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="font-serif text-2xl font-bold text-emerald-950">Data akun</h2>
                        <dl className="mt-5 space-y-4 text-sm">
                            <div>
                                <dt className="font-semibold text-stone-500">Nama</dt>
                                <dd className="mt-1 break-words font-bold text-emerald-950">{account.name}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-stone-500">Email</dt>
                                <dd className="mt-1 break-all font-bold text-emerald-950">{account.email}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-stone-500">Pelanggan sejak</dt>
                                <dd className="mt-1 font-bold text-emerald-950">{account.member_since ?? '-'}</dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-stone-500">Jumlah pesanan</dt>
                                <dd className="mt-1 font-bold text-emerald-950">{account.order_count} pesanan</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Link href={route('store.orders.index')} className="block rounded-2xl border border-amber-900/10 bg-amber-50 p-6 shadow-sm transition hover:bg-amber-100">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Riwayat belanja</p>
                            <p className="mt-2 font-serif text-2xl font-bold text-emerald-950">Pesanan Saya →</p>
                            <p className="mt-2 text-sm leading-6 text-stone-600">Lihat status dan detail setiap pesanan Anda di {brand.name}.</p>
                        </Link>
                        <Link href={route('store.catalog')} className="block rounded-2xl bg-emerald-800 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-emerald-700">Lanjut belanja</Link>
                        <button type="button" onClick={logout} className="block w-full rounded-2xl border border-stone-200 bg-white px-5 py-3.5 text-center text-sm font-bold text-rose-700 transition hover:bg-rose-50">Keluar</button>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
