import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { router } from '@inertiajs/react';

export default function DeleteProductModal({ show, product, onClose }) {
    const destroy = () => {
        if (!product) return;

        router.delete(route('admin.products.destroy', product.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <Modal show={show} maxWidth="lg" closeable onClose={onClose}>
            <div className="bg-slate-950 text-white">
                <div className="border-b border-white/10 px-6 py-5">
                    <h3 className="text-lg font-semibold">Delete Product</h3>
                    <p className="mt-1 text-sm text-slate-400">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="px-6 py-6">
                    <p className="text-sm leading-6 text-slate-300">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-white">
                            {product?.name}
                        </span>
                        ? All transaction references will remain protected by the
                        database rules.
                    </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
                    <SecondaryButton
                        type="button"
                        className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
                        onClick={onClose}
                    >
                        Cancel
                    </SecondaryButton>
                    <DangerButton
                        type="button"
                        onClick={destroy}
                    >
                        Delete Product
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
