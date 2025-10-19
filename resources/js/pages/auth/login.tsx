import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/lib/i18n';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm<{ email: string; password: string; remember: boolean }>({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <AuthLayout
            title={t('Login Page')}
            description={t('Enter your email and password below to log in')}
        >
            <Head title={t('Login Page')} />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('Email address')}</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t('Password')}</Label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="rounded-md text-sm text-black dark:text-white underline underline-offset-4 hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                >
                                    {t('Forgot password?')}
                                </Link>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="●●●●●●●●"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                            className="border-black dark:border-white" // Menambahkan kelas border kustom
                        />
                        <Label htmlFor="remember" className="text-black dark:text-white">{t('Remember me')}</Label> {/* Menghapus kelas underline */}
                    </div>

                    <Button className="mt-4 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('Login')}
                    </Button>
                </div>
            </form>

            <div className="space-x-1 text-center text-black dark:text-white">
                <span>{t("Don't have an account?")}</span>
                <Link href={route('register')} className="text-black dark:text-white underline underline-offset-4 hover:underline">
                    {t('Sign up')}
                </Link>
            </div>
        </AuthLayout>
    );
}