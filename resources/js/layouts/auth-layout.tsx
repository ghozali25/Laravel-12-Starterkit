import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
    const { props } = usePage();
    const { t } = useTranslation();

    const setting = props?.setting as {
        nama_app: string;
        logo?: string;
        warna?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
        background_image?: string; // Tambahkan ini
    };

    const primaryColor = setting?.warna || '#1ccd5aff';
    const primaryForeground = '#ffffff';

    // Gunakan gambar latar belakang dari pengaturan atau default ke null
    const backgroundImage = setting?.background_image ? `/storage/${setting.background_image}` : null;

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
        document.documentElement.style.setProperty('--color-primary-foreground', primaryForeground);

        // Skrip Lottie dihapus sementara untuk debugging
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.1/dist/dotlottie-wc.js';
        script.type = 'module';
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [primaryColor, primaryForeground]);

    return (
        <div
            className={cn(
                "flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-cover bg-center bg-fixed",
                !backgroundImage && "bg-white dark:bg-gray-900" // Default background putih jika tidak ada gambar
            )}
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
        >
            <div className="w-full max-w-md rounded-xl bg-white/50 shadow-xl backdrop-blur-xl dark:bg-gray-800/50 dark:shadow-none z-10">
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-0">
                            <Link
                                href={route('home')}
                                className="flex flex-col items-center gap-3 font-medium transition-opacity hover:opacity-90">
                                <div className="flex h-24 w-24 items-center justify-center">
                                    <AppLogoIcon className="size-24 fill-current text-black dark:text-white" />
                                </div>
                            </Link>

                            <div className="space-y-1.5 text-center">
                                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                    {t(title || '')}
                                </h1>
                                {description && (
                                    <p className="text-muted-foreground text-center text-sm leading-5">
                                        {t(description)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">{children}</div>
                    </div>
                </div>
            </div>
            {/* Footer tetap terpisah dan tidak di-blur */}
            <div className="border-t border-gray-100 px-8 py-6 text-center dark:border-gray-700/50 w-full max-w-md mt-6 rounded-xl bg-white/50 shadow-sm backdrop-blur-xl dark:bg-gray-800/50 dark:shadow-none z-10">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                    © {new Date().getFullYear()} {setting?.nama_app}. {t('All rights reserved.')}
                </p>
            </div>
        </div>
    );
}