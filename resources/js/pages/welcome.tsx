import React, { useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { type SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Welcome() {
  const { auth, setting } = usePage<SharedData>().props;
  const { t, locale } = useTranslation();

  const primaryColor = setting?.warna || '#1ccd5aff';
  const primaryForeground = '#ffffff';
  const registrationEnabled = setting?.registration_enabled ?? true; // Get registration_enabled setting

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--primary-foreground', primaryForeground);
    document.documentElement.style.setProperty('--color-primary-foreground', primaryForeground);
  }, [primaryColor, primaryForeground]);

  const handleAuthRedirect = (mode: 'login' | 'register') => {
    router.get(route(mode));
  };

  return (
    <>
      <Head title={t('Welcome')} />
      <div
        className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        {/* Language switcher */}
        <div className="absolute right-4 top-4 z-20">
          <select
            className="rounded-md border px-2 py-1 text-xs bg-white/90 dark:bg-gray-800/90"
            value={locale}
            onChange={(e) => {
              const value = e.target.value;
              if (value !== locale) {
                router.get(route('language.set', value), {}, { preserveScroll: true, preserveState: true });
              }
            }}
          >
            <option value="en">EN</option>
            <option value="id">ID</option>
          </select>
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

            <p className="text-lg text-white drop-shadow max-w-md mx-auto lg:mx-0">
              {t('Selamat datang di aplikasi kami. Nikmati pengalaman modern dan mudah digunakan.')}
            </p>

            {/* CTA */}
            {auth.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] via-[#8b5cf6] to-[#a855f7] bg-[length:200%_100%] bg-left hover:bg-right text-white font-semibold transition-all duration-500 transform hover:-translate-y-0.5 shadow-md hover:shadow-xl"
              >
                {t('Go to Dashboard')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <Link
                  href={route('login')}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] via-[#8b5cf6] to-[#a855f7] bg-[length:200%_100%] bg-left hover:bg-right text-white font-semibold transition-all duration-500 transform hover:-translate-y-0.5 shadow-md hover:shadow-xl"
                >
                  {t('Sign In')}
                </Link>
                {registrationEnabled && (
                  <Link
                    href={route('register')}
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] via-[#8b5cf6] to-[#a855f7] bg-[length:200%_100%] bg-right hover:bg-left text-white font-semibold transition-all duration-500 transform hover:-translate-y-0.5 shadow-md hover:shadow-xl"
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