// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button'; // Fixed import syntax
import AuthLayout from '@/layouts/auth-layout';
import { useTranslation } from '@/lib/i18n';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title={t('Verify Email')}
            description={t("Before getting started, verify your email address by clicking on the link we just emailed to you. If you didn't receive the email, we can send you another.")}
        >
            <Head title={t('Email Verification')} />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {t('A new verification link has been sent to the email address you provided during registration.')}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {t('Resend verification email')}
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm text-foreground">
                    {t('Log out')}
                </TextLink>
            </form>
        </AuthLayout>
    );
}