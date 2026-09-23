import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
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

const COLORS = ['#22d3ee', '#8b5cf6', '#f59e0b', '#10b981', '#fb7185'];

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

function StatCard({ label, value, note, tone }) {
    return (
        <div className="rounded-[28px] border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${tone}`} />
            <div className="mt-4 text-sm text-slate-400">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
            {note ? <div className="mt-2 text-xs text-slate-500">{note}</div> : null}
        </div>
    );
}

function SectionCard({ title, description, children, actions }) {
    return (
        <section className="rounded-[32px] border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {description ? (
                        <p className="mt-1 text-sm text-slate-400">{description}</p>
                    ) : null}
                </div>
                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function PeriodButton({ active, children, ...props }) {
    return (
        <button
            type="button"
            {...props}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                active
                    ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
        >
            {children}
        </button>
    );
}

export default function Index({ periods, selectedPeriod, report, exports }) {
    const periodLabel = periods.find((item) => item.value === selectedPeriod)?.label ?? 'Monthly';
    const transactionsCard = report.summary.find((card) => card.label === 'Transactions');
    const hasSales = Number(transactionsCard?.value ?? 0) > 0;

    const summaryCards = report.summary.map((card, index) => ({
        ...card,
        tone: [
            'from-cyan-400 to-blue-500',
            'from-emerald-400 to-teal-500',
            'from-fuchsia-400 to-violet-500',
            'from-amber-400 to-orange-500',
        ][index % 4],
    }));

    const paymentChart = report.payment_methods.map((item) => ({
        name: item.label,
        value: item.count,
        revenue: item.revenue,
    }));

    const cashierChart = report.cashier_performance.map((item) => ({
        name: item.name,
        transactions: item.transaction_count,
        revenue: item.revenue,
    }));

    const salesTrend = report.timeline;

    const updatePeriod = (period) => {
        router.get(route('admin.reports.index'), { period }, { preserveScroll: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            title="Reports"
            header={
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
                                Analytics Dashboard
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                                {periodLabel} View
                            </span>
                        </div>
                        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                            Sales summary, charts, payment analytics, and operational alerts.
                        </h2>
                        <p className="max-w-3xl text-sm leading-6 text-slate-300">
                            Use the period filters to switch between daily, weekly, and monthly views. Export the current dataset to PDF or Excel for reporting.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {periods.map((period) => (
                            <PeriodButton
                                key={period.value}
                                active={period.value === selectedPeriod}
                                onClick={() => updatePeriod(period.value)}
                            >
                                {period.label}
                            </PeriodButton>
                        ))}
                        <a
                            href={exports.pdf}
                            className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 transition hover:bg-slate-100"
                        >
                            Export PDF
                        </a>
                        <a
                            href={exports.excel}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/10"
                        >
                            Export Excel
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Reports" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <StatCard
                            key={card.label}
                            label={card.label}
                            value={
                                card.format === 'currency'
                                    ? formatCurrency(card.value)
                                    : formatNumber(card.value)
                            }
                            note={card.note}
                            tone={card.tone}
                        />
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                    <SectionCard
                        title="Sales Analytics"
                        description="Revenue and completed transactions over the selected period."
                    >
                        {hasSales ? (
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesTrend}>
                                        <defs>
                                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(value) => formatCurrency(value)}
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: '#020617',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                                borderRadius: 16,
                                                color: '#fff',
                                            }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Revenue"
                                            stroke="#22d3ee"
                                            fill="url(#salesGradient)"
                                            strokeWidth={3}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="transactions"
                                            name="Transactions"
                                            stroke="#8b5cf6"
                                            fillOpacity={0}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-16 text-center text-sm text-slate-400">
                                No completed sales yet. Once the first real transaction is paid, this chart will populate automatically.
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Payment Method Statistics"
                        description="Transaction volume and revenue by payment type."
                    >
                        {hasSales ? (
                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentChart}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={4}
                                        >
                                            {paymentChart.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: '#020617',
                                                border: '1px solid rgba(255,255,255,0.12)',
                                                borderRadius: 16,
                                                color: '#fff',
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-16 text-center text-sm text-slate-400">
                                No completed sales yet. Payment breakdown will appear here after the first paid transaction.
                            </div>
                        )}
                    </SectionCard>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <SectionCard
                        title="Top Selling Products"
                        description="Best sellers based on completed sales in the selected period."
                    >
                        <div className="space-y-3">
                            {report.top_products.length ? (
                                report.top_products.map((product, index) => (
                                    <div
                                        key={product.product_id}
                                        className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-3"
                                    >
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    #{index + 1}
                                                </span>
                                                <div className="truncate font-semibold text-white">
                                                    {product.name}
                                                </div>
                                            </div>
                                            <div className="mt-1 text-sm text-slate-400">
                                                {product.barcode}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                                                <span>Qty sold: {formatNumber(product.quantity_sold)}</span>
                                                <span>Stock: {product.stock}</span>
                                                <span>Min stock: {product.min_stock}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Revenue
                                            </div>
                                            <div className="mt-1 text-sm font-semibold text-cyan-300">
                                                {formatCurrency(product.revenue)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-slate-400">
                                    No completed sales found for this period.
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Cashier Performance"
                        description="Revenue and order counts by cashier."
                    >
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cashierChart} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={(value) => formatCurrency(value)}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                                        tickLine={false}
                                        width={120}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#020617',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            borderRadius: 16,
                                            color: '#fff',
                                        }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Revenue" radius={[0, 16, 16, 0]} fill="#22d3ee" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {cashierChart.map((cashier) => (
                                <div
                                    key={cashier.name}
                                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                                >
                                    <div className="text-sm font-semibold text-white">
                                        {cashier.name}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                                        <span>{formatNumber(cashier.transactions)} transactions</span>
                                        <span>{formatCurrency(cashier.revenue)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </section>

                <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <SectionCard
                        title="Low Stock Alerts"
                        description="Products that need restocking soon."
                    >
                        <div className="space-y-3">
                            {report.low_stock_alerts.length ? (
                                report.low_stock_alerts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-3"
                                    >
                                        <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-semibold text-white">
                                                {product.name}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                                {product.barcode}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Shortage
                                            </div>
                                            <div className="mt-1 text-sm font-semibold text-amber-300">
                                                {formatNumber(product.shortage)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-[24px] border border-dashed border-emerald-400/20 bg-emerald-400/10 px-4 py-10 text-center text-sm text-emerald-300">
                                    No low-stock alerts right now.
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Method Breakdown"
                        description="A quick summary of payment volume and channel usage."
                    >
                        <div className="space-y-3">
                            {paymentChart.map((item, index) => (
                                <div
                                    key={item.name}
                                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-white">
                                                {item.name}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                                {formatNumber(item.value)} transactions
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Revenue
                                            </div>
                                            <div className="mt-1 text-sm font-semibold text-cyan-300">
                                                {formatCurrency(item.revenue)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${Math.max(
                                                    paymentChart.length
                                                        ? (item.value /
                                                              Math.max(
                                                                  ...paymentChart.map((entry) => entry.value),
                                                              )) *
                                                          100
                                                        : 0,
                                                    8,
                                                )}%`,
                                                background: COLORS[index % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
