import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ToastStack from '@/Components/ToastStack';
import { useBrand } from '@/lib/brand';

const navigation = [
    { label: 'Beranda', href: route('store.home'), current: 'store.home' },
    { label: 'Katalog', href: route('store.catalog'), current: 'store.catalog' },
    { label: 'Kategori', href: `${route('store.catalog')}#kategori`, current: null },
];

const socialIconClass = 'h-4 w-4';

function InstagramIcon() {
    return (
        <svg className={socialIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" /></svg>
    );
}

function TiktokIcon() {
    return (
        <svg className={socialIconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 3c.4 2.2 1.8 3.7 4.1 3.9v3c-1.6 0-3-.5-4.1-1.3v6.1c0 3.7-2.6 6.3-6.1 6.3-3.4 0-6-2.6-6-6s2.6-6 6-6c.3 0 .7 0 1 .1v3.1c-.3-.1-.6-.2-1-.2-1.7 0-3 1.3-3 3s1.3 3 3 3c1.8 0 3.1-1.4 3.1-3.3V3h3Z" /></svg>
    );
}

function WhatsappIcon() {
    return (
        <svg className={socialIconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.4 0-.5L9.4 8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.7-.2.5-.9 2.2-.9 2.2 1 2 2.4 3.4 4.4 4.4.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.5-.2Z" /></svg>
    );
}

function MailIcon() {
    return (
        <svg className={socialIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
    );
}

function PinIcon() {
    return (
        <svg className={socialIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
    );
}

function StoreFooter({ brand }) {
    const hasContact = Boolean(brand.whatsapp || brand.email || brand.location);
    const hasSocial = Boolean(brand.instagram || brand.tiktok);

    return (
        <footer className="mt-16 border-t border-amber-900/10 bg-emerald-950 text-amber-50">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm sm:px-6 md:grid-cols-[1.3fr_0.7fr_1fr] lg:px-8">
                <div>
                    <div className="flex items-center gap-3">
                        <img src={brand.logoUrl} alt={brand.logoAlt} className="h-11 w-11 shrink-0 rounded-full bg-white object-contain" loading="lazy" />
                        <div>
                            <p className="font-serif text-lg font-bold">{brand.name}</p>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">{brand.shortDescription}</p>
                        </div>
                    </div>
                    <p className="mt-4 font-medium text-amber-100">“{brand.tagline}”</p>
                    <p className="mt-2 max-w-md leading-6 text-amber-100/70">{brand.description}</p>
                </div>

                <nav aria-label="Navigasi footer">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Navigasi</p>
                    <ul className="mt-4 space-y-2.5">
                        <li><Link href={route('store.home')} className="text-amber-50/85 transition hover:text-amber-300">Beranda</Link></li>
                        <li><Link href={route('store.catalog')} className="text-amber-50/85 transition hover:text-amber-300">Katalog</Link></li>
                        <li><Link href={route('store.cart.index')} className="text-amber-50/85 transition hover:text-amber-300">Keranjang</Link></li>
                    </ul>
                </nav>

                <div>
                    {hasContact ? (
                        <>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Kontak</p>
                            <ul className="mt-4 space-y-2.5 text-amber-50/85">
                                {brand.whatsapp ? <li><a href={brand.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-amber-300"><WhatsappIcon />{brand.whatsapp}</a></li> : null}
                                {brand.email ? <li><a href={`mailto:${brand.email}`} className="inline-flex items-center gap-2 break-all transition hover:text-amber-300"><MailIcon />{brand.email}</a></li> : null}
                                {brand.location ? <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0"><PinIcon /></span><span>{brand.location}</span></li> : null}
                            </ul>
                        </>
                    ) : null}
                    {hasSocial ? (
                        <>
                            <p className={`text-xs font-bold uppercase tracking-[0.2em] text-amber-300 ${hasContact ? 'mt-6' : ''}`}>Ikuti Kami</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {brand.instagram ? <a href={brand.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram TOKOTOKI" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-amber-100/25 p-3 transition hover:bg-white/10"><InstagramIcon /></a> : null}
                                {brand.tiktok ? <a href={brand.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok TOKOTOKI" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-amber-100/25 p-3 transition hover:bg-white/10"><TiktokIcon /></a> : null}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-amber-100/60 sm:px-6 lg:px-8">© {new Date().getFullYear()} {brand.name}. Semua hak dilindungi.</div>
            </div>
        </footer>
    );
}

export default function PublicLayout({ title, children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { auth, cartCount = 0 } = usePage().props;
    const brand = useBrand();
    const user = auth?.user ?? null;
    const closeMobile = () => setMobileOpen(false);
    const logout = () => {
        closeMobile();
        router.post(route('logout'));
    };

    const cartPill = (
        <Link href={route('store.cart.index')} className="rounded-full border border-amber-700/30 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:border-emerald-800 hover:text-emerald-800">Keranjang <span className="ml-1 inline-flex min-w-5 justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950">{cartCount}</span></Link>
    );

    const guestActions = (
        <>
            <Link href={route('login')} className="rounded-full px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50">Masuk</Link>
            <Link href={route('register')} className="rounded-full bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700">Daftar</Link>
        </>
    );

    const userActions = user ? (
        <>
            <Link href={route('store.orders.index')} className={`text-sm font-medium transition hover:text-emerald-800 ${route().current('store.orders.*') ? 'text-emerald-800' : 'text-stone-600'}`}>Pesanan Saya</Link>
            <Link href={route('store.account')} className={`max-w-36 truncate text-sm font-bold transition hover:text-emerald-800 ${route().current('store.account') ? 'text-emerald-800' : 'text-emerald-900'}`} title={user.name}>{user.name}</Link>
            <button type="button" onClick={logout} className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50">Keluar</button>
        </>
    ) : null;

    return (
        <div className="min-h-screen overflow-x-hidden bg-stone-50 text-stone-800">
            <Head title={title} />
            <header className="sticky top-0 z-40 border-b border-amber-900/10 bg-stone-50/95 backdrop-blur">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Navigasi utama">
                    <Link href={route('store.home')} className="flex min-w-0 items-center gap-3" onClick={closeMobile}>
                        <img
                            src={brand.logoUrl}
                            alt={brand.logoAlt}
                            className="h-10 w-10 shrink-0 rounded-full bg-white object-contain shadow-sm"
                            loading="eager"
                        />
                        <span className="min-w-0">
                            <span className="block truncate font-serif text-lg font-bold tracking-tight text-emerald-950">{brand.name}</span>
                            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">{brand.shortDescription}</span>
                        </span>
                    </Link>

                    <div className="hidden items-center gap-5 md:flex">
                        {navigation.map((item) => (
                            <Link key={item.label} href={item.href} className={`text-sm font-medium transition hover:text-emerald-800 ${item.current && route().current(item.current) ? 'text-emerald-800' : 'text-stone-600'}`}>
                                {item.label}
                            </Link>
                        ))}
                        {cartPill}
                        {user ? userActions : guestActions}
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <Link href={route('store.cart.index')} onClick={closeMobile} className="rounded-full border border-amber-700/30 px-3 py-1.5 text-xs font-semibold text-amber-800" aria-label={`Keranjang, ${cartCount} barang`}>🛒 <span className="ml-0.5 inline-flex min-w-5 justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950">{cartCount}</span></Link>
                        <button type="button" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-emerald-900" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-label="Buka navigasi">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                        </button>
                    </div>
                </nav>
                {mobileOpen ? (
                    <div className="border-t border-amber-900/10 bg-stone-50 px-4 pb-4 md:hidden">
                        <div className="flex flex-col gap-1 pt-2">
                            {navigation.map((item) => <Link key={item.label} href={item.href} onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-amber-100/60">{item.label}</Link>)}
                            {user ? (
                                <>
                                    <Link href={route('store.orders.index')} onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-amber-100/60">Pesanan Saya</Link>
                                    <Link href={route('store.account')} onClick={closeMobile} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-amber-100/60">Akun Saya · <span className="break-all">{user.name}</span></Link>
                                    <button type="button" onClick={logout} className="mt-1 rounded-xl border border-stone-200 px-3 py-3 text-left text-sm font-bold text-rose-700 hover:bg-rose-50">Keluar</button>
                                </>
                            ) : (
                                <div className="mt-1 grid grid-cols-2 gap-2">
                                    <Link href={route('login')} onClick={closeMobile} className="rounded-xl border border-emerald-800/30 px-3 py-3 text-center text-sm font-bold text-emerald-800 hover:bg-emerald-50">Masuk</Link>
                                    <Link href={route('register')} onClick={closeMobile} className="rounded-xl bg-emerald-800 px-3 py-3 text-center text-sm font-bold text-white hover:bg-emerald-700">Daftar</Link>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </header>
            <main>{children}</main>
            <ToastStack />
            <StoreFooter brand={brand} />
        </div>
    );
}
