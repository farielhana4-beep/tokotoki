import { Link, usePage } from '@inertiajs/react';
import {
    DashboardIcon,
    BellIcon,
    PosIcon,
    ProductsIcon,
    ReportsIcon,
    SettingsIcon,
    UsersIcon,
    SparklesIcon,
    ArrowUpRightIcon,
} from '@/Components/Icons';

const navigation = [
    { name: 'Dashboard', routeName: 'admin.dashboard', href: route('admin.dashboard'), roles: ['super_admin'], icon: DashboardIcon },
    { name: 'Products', routeName: 'admin.products.index', href: route('admin.products.index'), roles: ['super_admin'], icon: ProductsIcon },
    { name: 'POS Cashier', routeName: 'pos.index', href: route('pos.index'), roles: ['super_admin', 'kasir'], icon: PosIcon },
    { name: 'Transactions', routeName: 'admin.transactions.index', href: route('admin.transactions.index'), roles: ['super_admin', 'kasir'], icon: ArrowUpRightIcon },
    { name: 'Reports', routeName: 'admin.reports.index', href: route('admin.reports.index'), roles: ['super_admin'], icon: ReportsIcon },
    { name: 'Users', routeName: 'admin.users.index', href: route('admin.users.index'), roles: ['super_admin'], icon: UsersIcon },
    { name: 'Settings', routeName: 'admin.settings', href: route('admin.settings'), roles: ['super_admin'], icon: SettingsIcon },
];

function NavItem({ item, mobile = false, onNavigate }) {
    const active = item.routeName ? route().current(item.routeName) : false;
    const Icon = item.icon;

    const baseClasses = mobile
        ? 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition'
        : 'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition';

    const activeClasses = active
        ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-inset ring-cyan-400/20 shadow-lg shadow-cyan-950/10'
        : 'text-slate-300 hover:bg-white/5 hover:text-white';

    return (
        <Link href={item.href} className={`${baseClasses} ${activeClasses}`} onClick={onNavigate}>
            <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                    active ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/5 text-slate-400'
                }`}
            >
                <Icon className="h-5 w-5" />
            </span>
            <span className="flex-1">{item.name}</span>
            {active ? (
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
                    Active
                </span>
            ) : null}
        </Link>
    );
}

function SupportIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <path
                d="M4.5 12.5a7.5 7.5 0 1 1 15 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M6.5 14.5v-2a5.5 5.5 0 0 1 11 0v2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M7.5 17.5h2.25c.69 0 1.25-.56 1.25-1.25v-1.5c0-.69-.56-1.25-1.25-1.25H7.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16.5 17.5h-2.25c-.69 0-1.25-.56-1.25-1.25v-1.5c0-.69.56-1.25 1.25-1.25h2.25z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TimezoneIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <circle
                cx="12"
                cy="12"
                r="8.5"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M12 7.5v5l3.2 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function InfoCard({ icon: Icon, label, value, helper, valueClassName = '' }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-lg shadow-black/10 backdrop-blur-sm transition duration-300 hover:border-cyan-400/20 hover:bg-white/[0.07]">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-cyan-300">
                    <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                        {label}
                    </div>
                    <div className={`text-sm font-medium leading-6 text-white ${valueClassName}`}>
                        {value}
                    </div>
                    {helper ? (
                        <div className="text-xs leading-5 text-slate-400">
                            {helper}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function Sidebar({ mobile = false, onNavigate }) {
    const user = usePage().props.auth.user;
    const settings = usePage().props.settings ?? {};
    const branding = settings.branding ?? {};
    const role = user?.role ?? null;
    const visibleNavigation = navigation.filter((item) => item.roles.includes(role));
    const roleLabel = role === 'super_admin' ? 'Super Admin' : 'Kasir';

    return (
        <aside className={`flex h-full flex-col ${mobile ? 'bg-slate-950/96' : 'bg-slate-950/88'} backdrop-blur-2xl text-white`}>
            <div className="border-b border-white/10 px-6 py-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(59,130,246,0.24))] shadow-lg shadow-cyan-950/20">
                        {branding.logo_url ? (
                            <img
                                src={branding.logo_url}
                                alt={branding.app_name ?? 'TOKOTOKI'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <SparklesIcon className="h-7 w-7 text-cyan-300" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
                            {branding.app_name ?? 'TOKOTOKI'} Admin
                        </div>
                        <div className="mt-1 truncate text-lg font-semibold text-white">
                            {branding.app_name ?? 'TOKOTOKI'}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                            {branding.school_name ?? 'Store management workspace'}
                        </div>
                        <div className="mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                            {roleLabel}
                        </div>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    <InfoCard
                        icon={SupportIcon}
                        label="Support"
                        value={branding.school_email || 'admin@tokotoki.test'}
                        helper="Primary contact for admin and cashier support"
                        valueClassName="break-all sm:break-normal sm:truncate"
                    />
                    <InfoCard
                        icon={TimezoneIcon}
                        label="Timezone"
                        value={branding.timezone || 'Asia/Jakarta'}
                        helper="Used for sales logs, receipts, and reports"
                        valueClassName="truncate"
                    />
                </div>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-5">
                <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Workspace
                </div>
                {visibleNavigation.map((item) => (
                    <NavItem key={item.name} item={item} mobile={mobile} onNavigate={onNavigate} />
                ))}
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        <BellIcon className="h-4 w-4 text-cyan-300" />
                        System status
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">
                        All services online
                    </div>
                    <div className="mt-1 text-sm leading-6 text-slate-400">
                        Laravel, Inertia, React, Tailwind ready
                    </div>
                </div>
            </div>
        </aside>
    );
}
