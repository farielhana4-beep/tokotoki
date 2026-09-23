import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import ProductImageDropzone from './ProductImageDropzone';

const emptyProduct = {
    barcode: '',
    name: '',
    category: '',
    description: '',
    status: 'active',
    image: null,
    purchase_price: '',
    selling_price: '',
    stock: 0,
    min_stock: 0,
};

export default function ProductFormModal({
    show,
    mode,
    product,
    categoriesList = [],
    onClose,
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({ ...emptyProduct });

    useEffect(() => {
        if (!show) {
            return;
        }

        clearErrors();

        if (product) {
            setData({
                barcode: product.barcode ?? '',
                name: product.name ?? '',
                category: product.category ?? '',
                description: product.description ?? '',
                status: product.status ?? 'active',
                image: null,
                purchase_price: product.purchase_price ?? '',
                selling_price: product.selling_price ?? '',
                stock: product.stock ?? 0,
                min_stock: product.min_stock ?? 0,
            });
            return;
        }

        reset();
        setData({ ...emptyProduct });
    }, [show, product, clearErrors, reset, setData]);

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            forceFormData: Boolean(data.image),
            onSuccess: () => {
                onClose();
                clearErrors();
                reset();
                setData({ ...emptyProduct });
            },
        };

        if (mode === 'edit' && product) {
            // NOTE: real PUT multipart bodies are not parsed by PHP/Laravel,
            // and per-call `transform` is ignored by Inertia (only the
            // form-level transform runs). So spoof the method through the
            // form data itself: POST + _method=put works for both JSON and
            // multipart payloads. setData updates dataRef synchronously, so
            // post() below already includes _method.
            setData('_method', 'put');
            post(route('admin.products.update', product.id), options);
            return;
        }

        post(route('admin.products.store'), options);
    };

    const title = mode === 'edit' ? 'Edit Product' : 'Add Product';
    const submitLabel = mode === 'edit' ? 'Update Product' : 'Save Product';

    const fieldClass =
        'w-full rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400';
    const labelClass =
        'mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500';

    return (
        <Modal show={show} maxWidth="2xl" closeable onClose={onClose}>
            <form
                onSubmit={submit}
                className="flex max-h-[min(90vh,820px)] flex-col bg-slate-950 text-white"
            >
                <div className="shrink-0 border-b border-white/10 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                                Inventory
                            </p>
                            <h3 className="mt-1 text-xl font-semibold">{title}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white"
                            aria-label="Close modal"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <path
                                    d="M6 6l12 12M18 6L6 18"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
                    <div className="space-y-4">
                        <ProductImageDropzone
                            file={data.image}
                            existingImageUrl={product?.image_url}
                            error={errors.image}
                            onFileChange={(file) => setData('image', file)}
                        />

                        <div>
                            <InputLabel value="Product Name" className={labelClass} />
                            <TextInput
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={fieldClass}
                                placeholder="e.g. Bottled Water"
                                autoComplete="off"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Barcode" className={labelClass} />
                                <TextInput
                                    value={data.barcode}
                                    onChange={(e) => setData('barcode', e.target.value)}
                                    className={fieldClass}
                                    placeholder="e.g. 8991234567890"
                                    autoComplete="off"
                                />
                                <InputError message={errors.barcode} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Category" className={labelClass} />
                                <TextInput
                                    list="product-category-list"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className={fieldClass}
                                    placeholder="Beverages"
                                    autoComplete="off"
                                />
                                <datalist id="product-category-list">
                                    {categoriesList.map((category) => (
                                        <option key={category} value={category} />
                                    ))}
                                </datalist>
                                <InputError message={errors.category} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Purchase Price" className={labelClass} />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.purchase_price}
                                    onChange={(e) =>
                                        setData('purchase_price', e.target.value)
                                    }
                                    className={fieldClass}
                                    placeholder="0"
                                />
                                <InputError
                                    message={errors.purchase_price}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel value="Selling Price" className={labelClass} />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.selling_price}
                                    onChange={(e) =>
                                        setData('selling_price', e.target.value)
                                    }
                                    className={fieldClass}
                                    placeholder="0"
                                />
                                <InputError
                                    message={errors.selling_price}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Stock" className={labelClass} />
                                <TextInput
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value)}
                                    className={fieldClass}
                                    placeholder="0"
                                />
                                <InputError message={errors.stock} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Minimum Stock" className={labelClass} />
                                <TextInput
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.min_stock}
                                    onChange={(e) => setData('min_stock', e.target.value)}
                                    className={fieldClass}
                                    placeholder="0"
                                />
                                <InputError message={errors.min_stock} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Status" className={labelClass} />
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:ring-cyan-400"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Description" className={labelClass} />
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                placeholder="Optional product notes"
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>
                    </div>
                </div>

                <div className="shrink-0 border-t border-white/10 px-5 py-4">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <SecondaryButton
                            type="button"
                            className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
                            onClick={onClose}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="bg-cyan-500 hover:bg-cyan-400 focus:ring-cyan-400"
                        >
                            {processing ? 'Saving...' : submitLabel}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
