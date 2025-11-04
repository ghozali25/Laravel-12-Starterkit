import React, { useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { type SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Welcome() {
  const { auth, setting } = usePage<SharedData>().props;
  const { t } = useTranslation();

  const primaryColor = setting?.warna || '#1ccd5aff';
  const primaryForeground = '#ffffff';
  const registrationEnabled = setting?.registration_enabled ?? true; // Get registration_enabled setting

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
    document.documentElement.style.setProperty('--color-primary-foreground', primaryForeground);
  }, [primaryColor, primaryForeground]);

  useEffect(() => {
    const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement | null;
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

  const handleAuthRedirect = (mode: 'login' | 'register') => {
    router.get(route(mode));
  };

  return (
    <>
      <Head title={t('Welcome')} />
      <div className="relative min-h-screen flex flex-col justify-center px-6 bg-gradient-to-br from-background to-gray-50 dark:to-gray-900 overflow-hidden">
        {/* Particles background */}
        <canvas id="particles-canvas" className="absolute inset-0 z-0 pointer-events-none" />
        {/* Decorative blur elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-[var(--primary)]/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        {/* MAIN LAYOUT */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto w-full">
          {/* LEFT SIDE - TEXT */}
          <div className="text-center lg:text-left space-y-8 px-4 md:px-8">
            <div className="flex justify-center lg:justify-start items-center">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 flex items-center">
                {t('Welcome')}
              </h1>

              {/* 🔹 Lottie animation super close & aligned */}
              {/* Temporarily removed problematic Lottie animation */}
              {/* <div className="ml-[-8px] translate-y-[4px] w-[80px] sm:w-[100px] md:w-[140px]">
                <DotLottieReact
                  src="https://lottie.host/90eca65f-57a9-408a-ae6b-ce4964fba1c8/5wI2rfFT6b.lottie"
                  loop
                  autoplay
                />
              </div> */}
            </div>

            <p className="text-lg text-foreground max-w-md mx-auto lg:mx-0">
              {t('Selamat datang di aplikasi kami. Nikmati pengalaman modern dan mudah digunakan.')}
            </p>

            {/* CTA */}
            {auth.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                {t('Go to Dashboard')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <Link
                  href={route('login')}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  {t('Sign In')}
                </Link>
                {registrationEnabled && (
                  <Link
                    href={route('register')}
                    className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    {t('Register')}
                  </Link>
                )}
              </div>
            )}

            <div className="pt-6 text-sm text-foreground">
              {t('Creator By Ahmad Ghozali')}
            </div>
          </div>

          {/* RIGHT SIDE - BIG LOTTIE */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-[90%] sm:w-[500px] md:w-[600px] lg:w-[650px]">
              <DotLottieReact
                src="https://lottie.host/3fbc8b21-aa97-408a-ae6b-ce4964fba1c8/jDX4a2Fp4D.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}