import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n'; // Import useTranslation

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { props } = usePage();
    const { t } = useTranslation(); // Use the translation hook

    const setting = props?.setting as {
        nama_app: string;
        logo?: string;
        warna?: string;
        seo?: {
            title?: string;
            description?: string;
            keywords?: string;
        };
    };

    const primaryColor = setting?.warna || '#1ccd5aff';
    const primaryForeground = '#ffffff';

    useEffect(() => {
        // Set warna tema
        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
        document.documentElement.style.setProperty('--color-primary-foreground', primaryForeground);

        // Tambahkan script Lottie WC hanya sekali
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.1/dist/dotlottie-wc.js';
        script.type = 'module';
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [primaryColor, primaryForeground]);

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md rounded-xl bg-white shadow-sm dark:bg-gray-800/50 dark:shadow-none">
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col gap-8">
                        {/* Logo and Header Section */}
                        <div className="flex flex-col items-center gap-6">
                            <Link
                                href={route('home')}
                                className="flex flex-col items-center gap-3 font-medium transition-opacity hover:opacity-90">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {setting?.nama_app}
                                </span>
                            </Link>

                            {/* Judul dan Deskripsi */}
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

                        {/* Form Content */}
                        <div className="space-y-6">{children}</div>
                    </div>
                </div>

                {/* Optional Footer */}
                <div className="border-t border-gray-100 px-8 py-6 text-center dark:border-gray-700/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} {setting?.nama_app}. {t('All rights reserved.')}
                    </p>
                </div>
            </div>
        </div>
    );
}