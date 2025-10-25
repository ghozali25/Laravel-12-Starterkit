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
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: '%', x: 25, y: 25, width: 50, height: 50, aspect: 1 });
    const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Face-aware crop using FaceDetector API when available; fallback to center square crop
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

        // Try FaceDetector
        // @ts-ignore
        const FD = (window as any).FaceDetector ? new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;
        if (FD) {
            try {
                const faces = await FD.detect(img);
                if (faces && faces.length > 0) {
                    const box = faces[0].boundingBox as DOMRectReadOnly;
                    const cx = box.x + box.width / 2;
                    const cy = box.y + box.height / 2;
                    const half = Math.floor(Math.max(box.width, box.height) * 0.75); // margin
                    sx = Math.max(0, Math.floor(cx - half));
                    sy = Math.max(0, Math.floor(cy - half));
                    const ex = Math.min(w, sx + half * 2);
                    const ey = Math.min(h, sy + half * 2);
                    const side = Math.min(ex - sx, ey - sy);
                    sx = Math.max(0, Math.floor(cx - side / 2));
                    sy = Math.max(0, Math.floor(cy - side / 2));
                }
            } catch {}
        }

        const side = Math.min(size, w - sx, h - sy);
        const canvas = document.createElement('canvas');
        canvas.width = side;
        canvas.height = side;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side);
        return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
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
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, pc.x, pc.y, pc.width, pc.height, 0, 0, pc.width, pc.height);
        return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92));
    };

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
                                        (async () => {
                                            if (file) {
                                                setOriginalFile(file);
                                                // Prepare auto-crop as default, then open cropper for manual adjust
                                                try {
                                                    const blob = await cropToFaceOrCenter(file);
                                                    const auto = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', { type: 'image/jpeg' });
                                                    setData('avatar', auto);
                                                    setData('remove_avatar', false);
                                                    setPreviewUrl(URL.createObjectURL(auto));
                                                } catch {}
                                                setShowCropper(true);
                                            } else {
                                                setData('avatar', null);
                                                setPreviewUrl(null);
                                            }
                                        })();
                                    }}
                                />
                            </div>
                            {showCropper && originalFile && (
                                <div className="mt-3 space-y-3">
                                    <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(pc) => setPixelCrop(pc)} aspect={1}>
                                        <img src={URL.createObjectURL(originalFile)} alt="crop" />
                                    </ReactCrop>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => { setShowCropper(false); }}>{t('Cancel')}</Button>
                                        <Button type="button" onClick={async () => {
                                            if (!pixelCrop) return;
                                            const blob = await cropWithPixels(originalFile!, pixelCrop);
                                            const cropped = new File([blob], originalFile!.name.replace(/\.[^.]+$/, '') + '-cropped.jpg', { type: 'image/jpeg' });
                                            setData('avatar', cropped);
                                            setPreviewUrl(URL.createObjectURL(cropped));
                                            setShowCropper(false);
                                        }}>{t('Apply Crop')}</Button>
                                    </div>
                                </div>
                            )}
                            {(previewUrl || auth.user.avatar_url) && (
                                <Button type="button" variant="destructive" size="icon" onClick={() => { setData('remove_avatar', true); setPreviewUrl(null); }} title={t('Delete')}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            )}
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