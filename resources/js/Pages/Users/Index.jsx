import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

function RoleBadge({ role }) {
    const isAdmin = role === 'super_admin';

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] ${
                isAdmin
                    ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
                    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
            }`}
        >
            {isAdmin ? 'Super Admin' : 'Kasir'}
        </span>
    );
}

export default function Index({ users }) {
    const { auth, flash } = usePage().props;
    const currentUserId = auth.user?.id;

    const sendReset = (userId) => {
        router.post(route('admin.users.password-reset', userId), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            title="Users"
            header={
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                        Security Administration
                    </p>
                    <h2 className="text-2xl font-semibold text-white">
                        Manage cashier and admin password recovery
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300">
                        Super admins can send password reset links to kasir or
                        other super admin accounts. Self-reset is disabled for
                        super admin accounts.
                    </p>
                </div>
            }
        >
            <Head title="Users" />

            {flash?.status ? (
                <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    {flash.status}
                </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/20">
                <div className="border-b border-white/10 px-6 py-4">
                    <div className="text-sm font-medium text-white">
                        Account Directory
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                        Send reset emails through Mailtrap-enabled SMTP.
                    </div>
                </div>

                <div className="divide-y divide-white/10">
                    {users.map((user) => {
                        const isCurrentAdminSelfReset =
                            user.role === 'super_admin' &&
                            currentUserId === user.id;

                        return (
                            <div
                                key={user.id}
                                className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="text-base font-semibold text-white">
                                            {user.name}
                                        </div>
                                        <RoleBadge role={user.role} />
                                    </div>
                                    <div className="mt-1 text-sm text-slate-400">
                                        {user.email}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                        Added {user.created_at}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isCurrentAdminSelfReset ? (
                                        <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
                                            Self reset disabled
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => sendReset(user.id)}
                                            className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                                        >
                                            Send reset link
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
