import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

function Toast({ tone = 'success', title, message }) {
    const tones = {
        success: 'border-emerald-700 bg-emerald-950/95 text-emerald-50',
        error: 'border-rose-800 bg-rose-950/95 text-rose-50',
        info: 'border-slate-700 bg-slate-900/95 text-slate-50',
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl ${tones[tone]}`}>
            <div className="text-sm font-semibold">{title}</div>
            {message ? <div className="mt-1 text-sm leading-6 opacity-90">{message}</div> : null}
        </div>
    );
}

export default function ToastStack() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState([]);

    useEffect(() => {
        const next = [];

        if (flash?.success) next.push({ id: `flash-success-${Date.now()}`, tone: 'success', title: 'Success', message: flash.success });
        if (flash?.error) next.push({ id: `flash-error-${Date.now()}`, tone: 'error', title: 'Attention', message: flash.error });
        if (flash?.message) next.push({ id: `flash-message-${Date.now()}`, tone: 'info', title: 'Notice', message: flash.message });

        setVisible((current) => [
            ...current.filter((toast) => !String(toast.id).startsWith('flash-')),
            ...next,
        ]);
    }, [flash?.success, flash?.error, flash?.message]);

    useEffect(() => {
        const handleToast = (event) => {
            const detail = event?.detail ?? {};
            const id = detail.id ?? `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

            setVisible((current) => [
                ...current,
                {
                    id,
                    tone: detail.tone ?? 'info',
                    title: detail.title ?? 'Notice',
                    message: detail.message ?? '',
                },
            ]);
        };

        window.addEventListener('app:toast', handleToast);

        return () => window.removeEventListener('app:toast', handleToast);
    }, []);

    useEffect(() => {
        if (!visible.length) return undefined;

        const timer = window.setTimeout(() => setVisible([]), 4500);
        return () => window.clearTimeout(timer);
    }, [visible]);

    if (!visible.length) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
            {visible.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
}
