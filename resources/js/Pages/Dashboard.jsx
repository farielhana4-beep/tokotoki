import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ArrowUpRightIcon,
    DashboardIcon,
    PosIcon,
    ProductsIcon,
    ReportsIcon,
} from '@/Components/Icons';
import { EmptyState, GlassCard, SectionHeading } from '@/Components/Ui';

const COLORS = ['#22d3ee', '#8b5cf6', '#10b981', '#f59e0b', '#fb7185'];

function formatCurrency(value, currency = 'IDR') {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function MetricCard({ label, value, note, tone, icon: Icon }) {
    return (
        <GlassCard className="shine-hover p-5">
            <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${tone}`} />
            <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
                    {note ? <div className="mt-2 text-xs text-slate-500">{note}</div> : null}
                </div>
                {Icon ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-300">
                        <Icon className="h-5 w-5" />
                    </div>
                ) : null}
            </div>
        </GlassCard>
    );
}

function QuickAction({ title, description, href, icon: Icon }) {
    return (
        <Link href={href} className="shine-hover block rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        {Icon ? <Icon className="h-4 w-4 text-cyan-300" /> : null}
                        {title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </div>
                <ArrowUpRightIcon className="h-4 w-4 text-slate-500" />
            </div>
        </Link>
    );
}

export default function Dashboard({ report, metrics, recentTransactions }) {
    const { settings } = usePage().props;
    const currency = settings?.branding?.currency ?? 'IDR';
    const timeline = report?.timeline ?? [];
    const paymentMethods = report?.payment_methods ?? [];
    const topProducts = report?.top_products ?? [];
    const lowStockAlerts = report?.low_stock_alerts ?? [];

    return (
        <AuthenticatedLayout
            title="Dashboard"
            header={
                <SectionHeading
                    eyebrow="Premium cockpit"
                    title="TOKOTOKI operations at a glance"
                    description="Track daily sales, low stock items, payment channels, and cashier activity from one premium admin workspace."
                    actions={[
                        <Link key="reports" href={route('admin.reports.index')} className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                            Open Reports
                        </Link>,
                        <Link key="pos" href={route('pos.index')} className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                            Open POS
                        </Link>,
                    ]}
                />
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <MetricCard label="Today Revenue" value={formatCurrency(metrics.today_revenue, currency)} note="Paid transactions only" tone="from-cyan-400 to-blue-500" icon={DashboardIcon} />
                    <MetricCard label="Today Transactions" value={formatNumber(metrics.today_transactions)} note="Completed and pending sales" tone="from-emerald-400 to-teal-500" icon={PosIcon} />
                    <MetricCard label="Low Stock Products" value={formatNumber(metrics.low_stock_products)} note="Needs replenishment soon" tone="from-amber-400 to-orange-500" icon={ProductsIcon} />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                    <GlassCard className="p-5">
                        <SectionHeading
                            eyebrow="Sales analytics"
                            title="Weekly revenue trend"
                            description="Paid revenue and transaction volume for the last week."
                        />

                        <div className="mt-5 h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeline}>
                                    <defs>
                                        <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
                                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(value) => formatCurrency(value, currency)} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff' }} formatter={(value) => formatCurrency(value, currency)} />
                                    <Legend />
                                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22d3ee" fill="url(#dashboardRevenue)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#8b5cf6" fillOpacity={0} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <div className="space-y-6">
                        <GlassCard className="p-5">
                            <SectionHeading eyebrow="Payment mix" title="Channel usage" description="Cash versus QRIS adoption in the current period." />
                            <div className="mt-5 h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={paymentMethods} dataKey="count" nameKey="label" innerRadius={72} outerRadius={110} paddingAngle={4}>
                                            {paymentMethods.map((entry, index) => (
                                                <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-5">
                            <SectionHeading eyebrow="Quick actions" title="Fast access" description="Jump straight into common tasks." />
                            <div className="mt-5 space-y-3">
                                <QuickAction title="Open POS cashier" description="Start a fast checkout session for your store." href={route('pos.index')} icon={PosIcon} />
                                <QuickAction title="Manage products" description="Review catalog, stock levels, and pricing." href={route('admin.products.index')} icon={ProductsIcon} />
                                <QuickAction title="View analytics" description="Export reports and monitor trends." href={route('admin.reports.index')} icon={ReportsIcon} />
                            </div>
                        </GlassCard>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <GlassCard className="p-5">
                        <SectionHeading eyebrow="Best sellers" title="Top products" description="Best-selling items from the current reporting period." />

                        <div className="mt-5 space-y-3">
                            {topProducts.length ? topProducts.map((product, index) => (
                                <div key={product.product_id} className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3">
                                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">#{index + 1}</span>
                                            <div className="truncate font-semibold text-white">{product.name}</div>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-400">{product.barcode}</div>
                                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                                            <span>Qty sold: {formatNumber(product.quantity_sold)}</span>
                                            <span>Stock: {product.stock}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue</div>
                                        <div className="mt-1 text-sm font-semibold text-cyan-300">{formatCurrency(product.revenue, currency)}</div>
                                    </div>
                                </div>
                            )) : (
                                <EmptyState title="No top products yet" description="Once transactions are recorded, the best sellers panel will populate automatically." />
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-5">
                        <SectionHeading eyebrow="Alerts" title="Operational signals" description="Low stock warnings and recent payment activity." />

                        <div className="mt-5 space-y-5">
                            <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-4">
                                <div className="text-sm font-semibold text-amber-100">Low stock alerts</div>
                                <div className="mt-1 text-sm text-amber-50/80">{lowStockAlerts.length} items need review.</div>
                            </div>

                            <div className="space-y-3">
                                {recentTransactions.length ? recentTransactions.map((item) => (
                                    <div key={item.invoice_number} className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{item.invoice_number}</div>
                                                <div className="mt-1 text-xs text-slate-400">{item.cashier_name} · {item.created_at}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-cyan-300">{formatCurrency(item.total_price, currency)}</div>
                                                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.payment_method} · {item.payment_status}</div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <EmptyState title="No transactions yet" description="Recent sales activity will appear here as soon as the first checkout completes." />
                                )}
                            </div>
                        </div>
                    </GlassCard>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
