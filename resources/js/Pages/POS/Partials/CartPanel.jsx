function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function CartLineItem({ item, onIncrease, onDecrease, onRemove }) {
    return (
        <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        {item.barcode}
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-white">
                        {item.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                        {formatCurrency(item.price)} each
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-300 transition hover:bg-red-400/20"
                >
                    Remove
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 p-1">
                    <button
                        type="button"
                        onClick={() => onDecrease(item.id)}
                        className="h-9 w-9 rounded-xl text-white transition hover:bg-white/10"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(event) =>
                            onIncrease(item.id, event.target.value, true)
                        }
                        className="w-16 border-0 bg-transparent text-center text-sm font-semibold text-white focus:ring-0"
                    />
                    <button
                        type="button"
                        onClick={() => onIncrease(item.id, item.quantity + 1)}
                        className="h-9 w-9 rounded-xl text-white transition hover:bg-white/10"
                    >
                        +
                    </button>
                </div>

                <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        Subtotal
                    </div>
                    <div className="mt-1 text-sm font-semibold text-white">
                        {formatCurrency(item.price * item.quantity)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CartPanel({
    cart,
    subtotal,
    tax,
    discount,
    total,
    change,
    paymentMethod,
    onIncreaseQuantity,
    onDecreaseQuantity,
    onRemoveItem,
    onClearCart,
    onPreviewReceipt,
    onOpenCash,
    onOpenCard,
    onSetDiscount,
}) {
    const safeCart = safeArray(cart);

    return (
        <aside className="space-y-6 xl:sticky xl:top-6">
            <div className="glass-card rounded-[2rem] border border-white/10 bg-slate-900/85 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                            Checkout
                        </div>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                            Current Cart
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Build a receipt in real time before completing payment.
                        </p>
                    </div>

                    <button
                        type="button"
                    onClick={onClearCart}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
                >
                    Clear
                </button>
                </div>

                <div className="mt-6 max-h-[520px] space-y-3 overflow-auto pr-1">
                    {safeCart.length ? (
                        safeCart.map((item) => (
                            <CartLineItem
                                key={item.id}
                                item={item}
                                onIncrease={onIncreaseQuantity}
                                onDecrease={onDecreaseQuantity}
                                onRemove={onRemoveItem}
                            />
                        ))
                    ) : (
                        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-12 text-center text-sm text-slate-400">
                            Cart is empty. Scan a barcode or tap a product card to start.
                        </div>
                    )}
                </div>

                <div className="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-medium text-white">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Tax 11%</span>
                        <span className="font-medium text-white">
                            {formatCurrency(tax)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Discount</span>
                        <span className="font-medium text-white">
                            {formatCurrency(discount)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Total</span>
                        <span className="text-xl font-semibold text-cyan-300">
                            {formatCurrency(total)}
                        </span>
                    </div>
                    {paymentMethod === 'cash' ? (
                        <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>Change</span>
                            <span className="font-medium text-emerald-300">
                                {formatCurrency(change)}
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="mt-4 grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            Manual discount
                        </span>
                        <input
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(event) =>
                                onSetDiscount?.(Number(event.target.value))
                            }
                            className="w-36 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-right text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                    <button
                        type="button"
                        onClick={onOpenCash}
                        disabled={!safeCart.length}
                        className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/5"
                    >
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            Payment
                        </div>
                        <div className="mt-1 text-base font-semibold text-white">
                            Cash
                        </div>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onOpenCard}
                    disabled={!safeCart.length}
                    className="mt-3 w-full rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
                >
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        Payment
                    </div>
                    <div className="mt-1 text-base font-semibold text-white">
                        Debit / Credit card placeholder
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                        Coming soon
                    </div>
                </button>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={onPreviewReceipt}
                        disabled={!safeCart.length}
                        className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Receipt Preview
                    </button>
                    <button
                        type="button"
                        onClick={onOpenCash}
                        disabled={!safeCart.length}
                        className="rounded-[22px] bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Checkout
                    </button>
                </div>

                <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
                    Shortcuts: <span className="text-white">F2</span> cash, <span className="text-white">Esc</span> clear cart. Cart items: <span className="text-white">{safeCart.length}</span>
                </div>
            </div>
        </aside>
    );
}
