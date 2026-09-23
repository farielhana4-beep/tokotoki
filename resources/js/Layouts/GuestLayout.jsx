import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { settings } = usePage().props;
    const branding = settings?.branding ?? {};
    const appName = branding.app_name ?? 'TOKOTOKI';
    const tagline = branding.store_tagline ?? 'Kerajinan kecil, dekorasi yang berarti.';

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_28%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.92))]" />

            <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                <section className="hidden flex-col justify-between px-10 py-10 lg:flex">
                    <Link href="/" className="inline-flex items-center gap-3 self-start">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-lg shadow-cyan-500/10">
                            <ApplicationLogo className="h-7 w-7 fill-current text-cyan-300" />
                        </span>
                        <div>
                            <div className="text-sm font-semibold tracking-wide text-white">
                                {appName}
                            </div>
                            <div className="text-xs text-slate-400">
                                {appName} Admin & Store Management
                            </div>
                        </div>
                    </Link>

                    <div className="max-w-2xl space-y-8">
                        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                            {appName} · {tagline}
                        </span>

                        <div className="space-y-4">
                            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white">
                                One clean dashboard for cashier speed, inventory control, and reporting.
                            </h1>
                            <p className="max-w-xl text-base leading-7 text-slate-300">
                                Use your {appName} account to manage products, reports, and settings. Cashier accounts can process store transactions quickly and securely.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                    Ready workflow
                                </div>
                                <div className="mt-2 text-lg font-semibold text-white">
                                    Fast checkout
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Barcode scanning, quick cart changes, and payment capture in one flow.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                    Role aware
                                </div>
                                <div className="mt-2 text-lg font-semibold text-white">
                                    Secure access
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Admin and cashier routes stay separate so each user lands where they belong.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-2xl shadow-cyan-950/10">
                            <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                                Demo accounts
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                                    <div className="text-sm font-semibold text-white">
                                        SUPERADMIN
                                    </div>
                                    <div className="mt-2 text-sm text-slate-300">
                                        admin@koperasi.test
                                    </div>
                                    <div className="text-sm text-slate-300">
                                        password
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                                    <div className="text-sm font-semibold text-white">
                                        KASIR
                                    </div>
                                    <div className="mt-2 text-sm text-slate-300">
                                        kasir@koperasi.test
                                    </div>
                                    <div className="text-sm text-slate-300">
                                        password
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
                    <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
                        <div className="flex items-center justify-between border-b border-white/10 pb-5">
                            <Link href="/" className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                                    <ApplicationLogo className="h-6 w-6 fill-current text-cyan-300" />
                                </span>
                                <div>
                                    <div className="text-sm font-semibold text-white">
                                        {appName}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Secure access portal
                                    </div>
                                </div>
                            </Link>

                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                                POS
                            </div>
                        </div>

                        <div className="pt-6">
                            {children}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
