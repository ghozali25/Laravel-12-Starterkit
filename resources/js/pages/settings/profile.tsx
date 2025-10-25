import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadButton } from '@/components/ui/upload-button';
import { XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useTranslation } from '@/lib/i18n'; // Import useTranslation
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { t } = useTranslation(); // Use the translation hook
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        remove_avatar: false as boolean,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', data.name);
        form.append('email', data.email);
        if (data.avatar) form.append('avatar', data.avatar);
        form.append('remove_avatar', data.remove_avatar ? '1' : '0');
        form.append('_method', 'patch');

        // Use router.post with method spoofing for multipart PATCH
        router.post(route('profile.update'), form, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('avatar', null);
                setData('remove_avatar', false);
                setPreviewUrl(null);
                toast.success(t('Saved'));
            },
            onError: () => {
                toast.error(t('Failed to save'));
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Profile settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('Profile information')} description={t('Update your name and email address')} />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">{t('Employee Photo (Max 2MB)')}</Label>
                            <div className="flex items-center gap-4">
                                {(previewUrl || auth.user.avatar_url) && (
                                    <img src={previewUrl || (auth.user.avatar_url as string)} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
                                )}
                                <UploadButton
                                    accept="image/jpeg,image/png,image/webp"
                                    label={t('Upload')}
                                    placeholder={t('No file chosen')}
                                    onFileSelected={(file) => {
                                        setData('avatar', file);
                                        if (file) setData('remove_avatar', false);
                                        setPreviewUrl(file ? URL.createObjectURL(file) : null);
                                    }}
                                />
                                {(previewUrl || auth.user.avatar_url) && (
                                    <Button type="button" variant="destructive" size="icon" onClick={() => { setData('remove_avatar', true); setPreviewUrl(null); }} title={t('Delete')}>
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {errors.avatar && <p className="text-sm text-red-500">{errors.avatar}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('Name')}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder={t('Full name')}
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('Email address')}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder={t('Email address')}
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-gray-800">
                                    {t('Your email address is unverified.')}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        {t('Click here to re-send the verification email.')}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        {t('A new verification link has been sent to your email address.')}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{t('Save')}</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-gray-600">{t('Saved')}</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {auth.is_admin && <DeleteUser />}
            </SettingsLayout>
        </AppLayout>
    );
}