import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useBrand } from '@/lib/brand';

export default function Login({ status, canResetPassword }) {
    const brand = useBrand();
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const isSuperAdmin = auth?.user?.role === 'super_admin';

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                        Masuk
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-white">
                        Selamat datang kembali
                    </h1>
                    <p className="text-sm leading-6 text-slate-300">
                        Masuk ke akun {brand.name} Anda.
                    </p>
                </div>

                {status ? (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                        {status}
                    </div>
                ) : null}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Alamat email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="admin@koperasi.test"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="password" value="Kata sandi" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center gap-3">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span className="text-sm text-slate-300">
                                Ingat saya
                            </span>
                        </label>

                        {canResetPassword && !isSuperAdmin ? (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                            >
                                Lupa kata sandi?
                            </Link>
                        ) : null}
                    </div>

                    {isSuperAdmin ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
                            Password reset for super admin accounts is handled
                            from the user management screen.
                        </div>
                    ) : null}

                    <PrimaryButton className="w-full" disabled={processing}>
                        {processing ? 'Memproses...' : 'Masuk'}
                    </PrimaryButton>
                </form>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <div className="font-semibold text-white">Demo access</div>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Superadmin
                            </div>
                            <div className="mt-2 text-slate-200">admin@koperasi.test</div>
                            <div className="text-slate-400">password</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Kasir
                            </div>
                            <div className="mt-2 text-slate-200">kasir@koperasi.test</div>
                            <div className="text-slate-400">password</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Belum punya akun?</span>
                    <Link
                        href={route('register')}
                        className="font-medium text-white transition hover:text-cyan-300"
                    >
                        Daftar
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
