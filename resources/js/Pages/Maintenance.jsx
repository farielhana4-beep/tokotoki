import { Head } from '@inertiajs/react';

export default function Maintenance({ branding = {} }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Head title="Maintenance" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_35%)]" />
                <div className="relative z-10 w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/10">
                            {branding.logo_url ? (
                                <img
                                    src={branding.logo_url}
                                    alt={branding.app_name ?? 'TOKOTOKI'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-cyan-300">KP</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                                System Maintenance
                            </p>
                            <h1 className="text-3xl font-semibold text-white">
                                {branding.app_name ?? 'TOKOTOKI'} is temporarily unavailable
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-400">
                                The system is currently in maintenance mode. Super admin users can still sign in and manage the platform, while cashier access is temporarily paused.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">School</p>
                            <p className="mt-2 text-sm font-medium text-white">
                                {branding.school_name || 'School cooperative'}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                {branding.school_email || 'Contact the administrator'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                            <p className="mt-2 text-sm font-medium text-white">Maintenance mode enabled</p>
                            <p className="mt-1 text-xs text-slate-400">
                                Please check back shortly.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Access</p>
                            <p className="mt-2 text-sm font-medium text-white">Super admin only</p>
                            <a
                                href={route('login')}
                                className="mt-3 inline-flex text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                            >
                                Sign in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
