import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/lib/i18n';
import { SharedData } from '@/types'; // Import SharedData type

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    recaptchaSiteKey?: string;
}

export default function Login({ status, canResetPassword, recaptchaSiteKey }: LoginProps) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false as boolean, // Explicitly define as boolean
        'g-recaptcha-response': '' as string,
    });

    const { setting } = usePage<SharedData>().props;
    const registrationEnabled = setting?.registration_enabled ?? true; // Default to true if not set
    const [captchaReady, setCaptchaReady] = useState(false);
    const captchaRef = useRef<HTMLDivElement | null>(null);
    const [widgetId, setWidgetId] = useState<number | null>(null);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, [reset]);

    // Load Google reCAPTCHA v2 script
    useEffect(() => {
        if (!recaptchaSiteKey) return;
        const scriptId = 'recaptcha-api-js';
        if (document.getElementById(scriptId)) {
            setCaptchaReady(true);
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => setCaptchaReady(true);
        document.body.appendChild(script);
        return () => {
            // do not remove script globally, keep cached for navigation
        };
    }, [recaptchaSiteKey]);

    // Callback to receive token from captcha
    useEffect(() => {
        // Attach a global callback to capture token if needed
        (window as any).onCaptchaVerified = (token: string) => {
            setData('g-recaptcha-response', token);
            if (errors['g-recaptcha-response']) clearErrors('g-recaptcha-response');
        };
        return () => {
            delete (window as any).onCaptchaVerified;
        };
    }, [setData, errors, clearErrors]);

    // Explicitly render the reCAPTCHA widget once script is ready (avoids needing a full page refresh)
    useEffect(() => {
        if (!recaptchaSiteKey || !captchaReady || widgetId !== null) return;
        const grecaptcha = (window as any).grecaptcha;
        if (grecaptcha && captchaRef.current) {
            const id = grecaptcha.render(captchaRef.current, {
                sitekey: recaptchaSiteKey,
                callback: (token: string) => {
                    setData('g-recaptcha-response', token);
                    if (errors['g-recaptcha-response']) clearErrors('g-recaptcha-response');
                },
            });
            setWidgetId(id);
        }
    }, [recaptchaSiteKey, captchaReady, widgetId, setData, errors, clearErrors]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Ensure token exists before posting
        if (recaptchaSiteKey && !data['g-recaptcha-response']) {
            // Let backend also validate, but prevent accidental empty submits
            setData(
                'g-recaptcha-response',
                (document.querySelector('textarea[name="g-recaptcha-response"]') as HTMLTextAreaElement)?.value || ''
            );
        }
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

                    {recaptchaSiteKey && (
                        <div className="space-y-2">
                            <div ref={captchaRef} />
                            <InputError message={errors['g-recaptcha-response'] as string} />
                        </div>
                    )}

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)} // Cast to boolean
                            className="border-black dark:border-white"
                        />
                        <Label htmlFor="remember" className="text-black dark:text-white">{t('Remember me')}</Label>
                    </div>

                    <Button className="mt-4 w-full" disabled={processing || (Boolean(recaptchaSiteKey) && !data['g-recaptcha-response'])}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('Login')}
                    </Button>
                </div>
            </form>

            {registrationEnabled && (
                <div className="space-x-1 text-center text-black dark:text-white">
                    <span>{t("Don't have an account?")}</span>
                    <Link href={route('register')} className="text-black dark:text-white underline underline-offset-4 hover:underline">
                        {t('Sign up')}
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
}