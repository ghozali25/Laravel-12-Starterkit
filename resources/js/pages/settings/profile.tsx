import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadButton } from '@/components/ui/upload-button';
import { XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile settings', href: '/settings/profile' },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    const { data, setData, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        remove_avatar: false,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: '%', x: 25, y: 25, width: 50, height: 50 });
    const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Auto-face or center crop
    const cropToFaceOrCenter = async (file: File): Promise<Blob> => {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = URL.createObjectURL(file);
        });

        const w = img.width, h = img.height;
        const size = Math.min(w, h);
        let sx = Math.floor((w - size) / 2);
        let sy = Math.floor((h - size) / 2);

        // Face detection
        const FD = (window as any).FaceDetector ? new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;
        if (FD) {
            try {
                const faces = await FD.detect(img);
                if (faces.length > 0) {
                    const box = faces[0].boundingBox;
                    const cx = box.x + box.width / 2;
                    const cy = box.y + box.height / 2;
                    const half = Math.floor(Math.max(box.width, box.height) * 0.75);
                    sx = Math.max(0, Math.floor(cx - half));
                    sy = Math.max(0, Math.floor(cy - half));
                }
            } catch {}
        }

        const side = Math.min(size, w - sx, h - sy);
        const canvas = document.createElement('canvas');
        canvas.width = side;
        canvas.height = side;
        canvas.getContext('2d')!.drawImage(img, sx, sy, side, side, 0, 0, side, side);

        return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
    };

    const cropWithPixels = async (file: File, pc: PixelCrop): Promise<Blob> => {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = URL.createObjectURL(file);
        });

        const canvas = document.createElement('canvas');
        canvas.width = pc.width;
        canvas.height = pc.height;
        canvas.getContext('2d')!.drawImage(img, pc.x, pc.y, pc.width, pc.height, 0, 0, pc.width, pc.height);

        return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', data.name);
        form.append('email', data.email);
        if (data.avatar) form.append('avatar', data.avatar);
        form.append('remove_avatar', data.remove_avatar ? '1' : '0');
        form.append('_method', 'patch');

        router.post(route('profile.update'), form, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('avatar', null);
                setData('remove_avatar', false);
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

                        {/* Avatar */}
                        <div className="grid gap-2">
                            <Label>{t('Employee Photo (Max 2MB)')}</Label>

                            <div className="flex items-center gap-4">
                                <div className="relative inline-block h-12 w-12">
                                    {!data.remove_avatar && (previewUrl || auth.user.avatar_url) && (
                                        <>
                                            <img
                                                src={(previewUrl || auth.user.avatar_url) ?? undefined}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                onClick={() => {
                                                    setData('remove_avatar', true);
                                                    setData('avatar', null);
                                                    setPreviewUrl(null);
                                                    setOriginalFile(null);
                                                    setShowCropper(false);
                                                }}
                                            >
                                                <XCircle className="h-3 w-3" />
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <UploadButton
                                    accept="image/jpeg,image/png,image/webp"
                                    label={t('Upload')}
                                    placeholder={t('No file chosen')}
                                    onFileSelected={async (file) => {
                                        if (!file) {
                                            setData('avatar', null);
                                            setPreviewUrl(null);
                                            setOriginalFile(null);
                                            setShowCropper(false);
                                            return;
                                        }

                                        // Selalu tampilkan preview segera setelah file dipilih
                                        const objectUrl = URL.createObjectURL(file);
                                        setPreviewUrl(objectUrl);
                                        setData('avatar', file);
                                        setData('remove_avatar', false);
                                        setOriginalFile(file);

                                        try {
                                            const blob = await cropToFaceOrCenter(file);
                                            const auto = new File([blob], `${file.name}-cropped.jpg`, { type: 'image/jpeg' });
                                            setData('avatar', auto);
                                            setPreviewUrl(URL.createObjectURL(auto));
                                        } catch {
                                            // Jika auto-crop gagal, tetap gunakan preview dari file asli
                                        }
                                    }}
                                />
                            </div>
                        
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('Email address')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Verify Email */}
                        {mustVerifyEmail && !auth.user.email_verified_at && (
                            <div>
                                <p className="text-sm text-gray-800">
                                    {t('Your email address is unverified.')}{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-gray-600 underline"
                                    >
                                        {t('Click here to re-send the verification email.')}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <p className="mt-2 text-sm text-green-600">
                                        {t('A new verification link has been sent to your email address.')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Save */}
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
            </SettingsLayout>
        </AppLayout>
    );
}
