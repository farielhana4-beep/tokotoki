import Modal from '@/Components/Modal';

const PLACEHOLDER_IMAGE = '/images/product-placeholder.svg';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function StockBadge({ stockStatus }) {
    if (stockStatus === 'critical') {
        return (
            <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-300">
                Critical
            </span>
        );
    }

    if (stockStatus === 'warning') {
        return (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                Low stock
            </span>
        );
    }

    return (
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Healthy
        </span>
    );
}

export default function ProductImagePreviewModal({ show, product, onClose, onEdit }) {
    const imageUrl = product?.image_url || PLACEHOLDER_IMAGE;
    const isActive = (product?.status ?? 'active') === 'active';

    return (
        <Modal show={show} maxWidth="4xl" closeable onClose={onClose}>
            <div className="bg-slate-950 text-white">
                <div className="border-b border-white/10 px-6 py-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                        Product detail preview
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold">
                        {product?.name ?? 'Selected product'}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Square-cropped preview with price, stock, category, and visibility status.
                    </p>
                </div>

                <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_0.9fr]">
                    <div className="space-y-4">
                        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl shadow-black/30">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img
                                    src={imageUrl}
                                    alt={product?.name ?? 'Product image'}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                    Barcode
                                </div>
                                <div className="mt-2 font-medium text-white">
                                    {product?.barcode ?? '-'}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                    Category
                                </div>
                                <div className="mt-2 font-medium text-white">
                                    {product?.category ?? 'General'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                        Product card
                                    </div>
                                    <div className="mt-1 truncate text-xl font-semibold text-white">
                                        {product?.name ?? '-'}
                                    </div>
                                </div>
                                <StockBadge stockStatus={product?.stock_status} />
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                        Stock
                                    </div>
                                    <div className="mt-2 text-2xl font-semibold text-white">
                                        {Number(product?.stock ?? 0)}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                        Minimum
                                    </div>
                                    <div className="mt-2 text-2xl font-semibold text-white">
                                        {Number(product?.min_stock ?? 0)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                        Purchase
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-white">
                                        {formatCurrency(product?.purchase_price)}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                        Selling
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-cyan-300">
                                        {formatCurrency(product?.selling_price)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                    Description
                                </div>
                                <p className="mt-2">
                                    {product?.description || 'No description provided yet.'}
                                </p>
                            </div>

                            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                    Status
                                </div>
                                <p className="mt-2 font-medium text-white">
                                    {isActive ? 'Active - visible in POS' : 'Inactive - hidden from POS'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 border-t border-white/10 px-6 py-4">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Close
                        </button>
                        {typeof onEdit === 'function' ? (
                            <button
                                type="button"
                                onClick={() => onEdit(product)}
                                disabled={!product}
                                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Edit Product
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
