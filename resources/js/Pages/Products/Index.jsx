import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import DeleteProductModal from './Partials/DeleteProductModal';
import ProductFormModal from './Partials/ProductFormModal';
import ProductImagePreviewModal from './Partials/ProductImagePreviewModal';

const PLACEHOLDER_IMAGE = '/images/product-placeholder.svg';

function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function StockBadge({ product }) {
    if (product.stock_status === 'critical') {
        return (
            <span className="inline-flex items-center rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-300">
                Critical
            </span>
        );
    }

    if (product.stock_status === 'warning') {
        return (
            <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                Low Stock
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            In Stock
        </span>
    );
}

function Pagination({ links }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {links.map((link, index) => {
                const commonClasses =
                    'rounded-xl border px-3 py-2 text-sm transition';
                const activeClasses = link.active
                    ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white';
                const disabledClasses = !link.url
                    ? 'pointer-events-none opacity-40'
                    : '';

                return (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url ?? ''}
                        preserveScroll
                        className={`${commonClasses} ${activeClasses} ${disabledClasses}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

function ProductImageThumb({ product, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg shadow-black/20 transition hover:border-cyan-400/30 sm:w-24"
        >
            <img
                src={product.image_url || PLACEHOLDER_IMAGE}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
        </button>
    );
}

export default function Index({ products, filters, stats }) {
    const page = usePage();
    const { flash, categoriesList = [] } = page.props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const safePaginatedProducts = {
        data: Array.isArray(products?.data) ? products.data : [],
        links: Array.isArray(products?.links) ? products.links : [],
        from: typeof products?.from === 'number' ? products.from : 0,
        to: typeof products?.to === 'number' ? products.to : 0,
        total: typeof products?.total === 'number' ? products.total : 0,
    };
    const productItems = safePaginatedProducts.data;
    const productLinks = safePaginatedProducts.links;
    const hasResults = productItems.length > 0;

    const statsCards = useMemo(
        () => [
            {
                label: 'Total Products',
                value: stats.total_products,
                tone: 'from-cyan-400 to-blue-500',
            },
            {
                label: 'Low Stock',
                value: stats.low_stock_products,
                tone: 'from-amber-400 to-orange-500',
            },
            {
                label: 'Visible On Page',
                value: productItems.length,
                tone: 'from-emerald-400 to-teal-500',
            },
        ],
        [productItems.length, stats.low_stock_products, stats.total_products],
    );

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            route('admin.products.index'),
            { search },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const openCreate = () => {
        setSelectedProduct(null);
        setFormMode('create');
        setShowForm(true);
    };

    const openEdit = (product) => {
        setSelectedProduct(product);
        setFormMode('edit');
        setShowForm(true);
    };

    const openDelete = (product) => {
        setSelectedProduct(product);
        setShowDelete(true);
    };

    const openPreview = (product) => {
        setSelectedProduct(product);
        setShowPreview(true);
    };

    return (
        <AuthenticatedLayout
            title="Products"
            header={
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                            Inventory Management
                        </p>
                        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                            Products
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-slate-300">
                            Manage product images, barcode, stock, purchase price,
                            and selling price from one professional inventory
                            workspace.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        Add Product
                    </button>
                </div>
            }
        >
            <Head title="Products" />

            {flash?.success ? (
                <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    {flash.success}
                </div>
            ) : null}

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    {statsCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-black/20 backdrop-blur"
                        >
                            <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${card.tone}`} />
                            <div className="mt-4 text-sm text-slate-400">
                                {card.label}
                            </div>
                            <div className="mt-2 text-3xl font-semibold text-white">
                                {card.value}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Search products
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Search by barcode or product name.
                            </p>
                        </div>

                        <form
                            onSubmit={submitSearch}
                            className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"
                        >
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search barcode or name..."
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400 sm:w-96"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                                >
                                    Search
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('admin.products.index'), {}, {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        });
                                    }}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-6 space-y-4 md:hidden">
                        {hasResults ? (
                            productItems.map((product) => (
                                <article
                                    key={product.id}
                                    className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <ProductImageThumb
                                            product={product}
                                            onClick={() => openPreview(product)}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                        {product.barcode}
                                                    </div>
                                                    <div className="mt-1 truncate text-base font-semibold text-white">
                                                        {product.name}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                                                            {product.category}
                                                        </span>
                                                        <span className={`rounded-full border px-2.5 py-1 ${product.is_active ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-slate-400/20 bg-slate-400/10 text-slate-300'}`}>
                                                            {product.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <StockBadge product={product} />
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                        Stock
                                                    </div>
                                                    <div className="mt-1 font-medium text-white">
                                                        {product.stock}
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                        Selling
                                                    </div>
                                                    <div className="mt-1 font-medium text-cyan-300">
                                                        {formatCurrency(product.selling_price)}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                                                {product.description || 'No description yet.'}
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(product)}
                                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDelete(product)}
                                                    className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-red-300 transition hover:bg-red-400/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-3xl border border-white/10 bg-slate-950/50 px-5 py-14 text-center text-sm text-slate-400">
                                No products found. Try a different search or add a new product.
                            </div>
                        )}
                    </div>

                    <div className="mt-6 hidden overflow-hidden rounded-3xl border border-white/10 md:block">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-white/5">
                                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                                        <th className="px-5 py-4">Image</th>
                                        <th className="px-5 py-4">Barcode</th>
                                        <th className="px-5 py-4">Product</th>
                                        <th className="px-5 py-4">Stock</th>
                                        <th className="px-5 py-4">Purchase</th>
                                        <th className="px-5 py-4">Selling</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 bg-slate-950/40">
                                    {hasResults ? (
                                        productItems.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="transition hover:bg-white/5"
                                            >
                                                <td className="px-5 py-4">
                                                    <ProductImageThumb
                                                        product={product}
                                                        onClick={() =>
                                                            openPreview(product)
                                                        }
                                                    />
                                                </td>
                                                <td className="px-5 py-4 text-sm font-medium text-white">
                                                    {product.barcode}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-white">
                                                        {product.name}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                                                            {product.category}
                                                        </span>
                                                        <span className={`rounded-full border px-2.5 py-1 ${product.is_active ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-slate-400/20 bg-slate-400/10 text-slate-300'}`}>
                                                            {product.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-400">
                                                        Minimum stock: {product.min_stock}
                                                    </div>
                                                    <div className="mt-2 line-clamp-2 text-xs leading-6 text-slate-400">
                                                        {product.description || 'No description yet.'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-200">
                                                    {product.stock}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-200">
                                                    {formatCurrency(product.purchase_price)}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-200">
                                                    {formatCurrency(product.selling_price)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StockBadge product={product} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(product)
                                                            }
                                                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/10"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDelete(product)
                                                            }
                                                            className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-red-300 transition hover:bg-red-400/20"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="px-5 py-16 text-center text-sm text-slate-400"
                                            >
                                                No products found. Try a different search or add a new product.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-sm text-slate-400">
                            Showing {safePaginatedProducts.from} to {safePaginatedProducts.to} of{' '}
                            {safePaginatedProducts.total} products
                        </div>
                        <Pagination links={productLinks} />
                    </div>
                </section>
            </div>

            <ProductFormModal
                show={showForm}
                mode={formMode}
                product={selectedProduct}
                categoriesList={categoriesList}
                onClose={() => setShowForm(false)}
            />

            <DeleteProductModal
                show={showDelete}
                product={selectedProduct}
                onClose={() => setShowDelete(false)}
            />

            <ProductImagePreviewModal
                show={showPreview}
                product={selectedProduct}
                onClose={() => setShowPreview(false)}
                onEdit={(product) => {
                    const target = product ?? selectedProduct;

                    setShowPreview(false);

                    if (target) {
                        openEdit(target);
                    }
                }}
            />
        </AuthenticatedLayout>
    );
}
