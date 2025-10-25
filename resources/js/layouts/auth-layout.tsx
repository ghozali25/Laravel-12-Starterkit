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

    // Particles (local canvas) background
    useEffect(() => {
        const canvas = document.getElementById('auth-particles-canvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let rafId = 0;
        let running = true;
        const DPR = Math.min(window.devicePixelRatio || 1, 2);
        const setSize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            const w = rect ? rect.width : window.innerWidth;
            const h = rect ? rect.height : window.innerHeight;
            canvas.width = Math.floor(w * DPR);
            canvas.height = Math.floor(h * DPR);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        };
        setSize();
        window.addEventListener('resize', setSize);

        const isMobile = window.innerWidth < 640;
        const count = isMobile ? 100 : 180;
        const speed = isMobile ? 1.0 : 2.0;
        const color = primaryColor || '#9ca3af';
        const particleOpacity = 0.38;
        const linkOpacity = 0.28;
        const linkDist = 170;

        const hexToRgba = (hex: string, a: number) => {
            let h = hex.replace('#', '');
            if (h.length === 3) h = h.split('').map((c) => c + c).join('');
            const num = parseInt(h, 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return `rgba(${r},${g},${b},${a})`;
        };

        type P = { x: number; y: number; vx: number; vy: number };
        const particles: P[] = Array.from({ length: count }, () => ({
            x: Math.random() * (canvas.width / DPR),
            y: Math.random() * (canvas.height / DPR),
            vx: (Math.random() * 2 - 1) * speed,
            vy: (Math.random() * 2 - 1) * speed,
        }));

        const draw = () => {
            if (!running) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = hexToRgba(color, particleOpacity);
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = hexToRgba(color, linkOpacity);
            ctx.lineWidth = 1.2;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.hypot(dx, dy);
                    if (d < linkDist) {
                        ctx.globalAlpha = 1 - d / linkDist;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
            for (const p of particles) {
                p.x += p.vx * 0.5;
                p.y += p.vy * 0.5;
                if (p.x < 0 || p.x > canvas.width / DPR) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height / DPR) p.vy *= -1;
            }
            rafId = requestAnimationFrame(draw);
        };
        rafId = requestAnimationFrame(draw);
        return () => {
            running = false;
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', setSize);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [primaryColor]);

    return (
        <div
            className={cn(
                "relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-cover bg-center bg-fixed",
                !backgroundImage && "bg-white dark:bg-gray-900" // Default background putih jika tidak ada gambar
            )}
            style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
        >
            {/* Particles Background */}
            <canvas id="auth-particles-canvas" className="pointer-events-none absolute inset-0 z-0" />
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