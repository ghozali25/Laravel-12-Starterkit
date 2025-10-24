import React, { useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { type SharedData } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

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

  const handleAuthRedirect = (mode: 'login' | 'register') => {
    router.visit(route(mode), {
      // Removed data: { initialMode: mode } as it's not needed and adds to the URL
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title={t('Welcome')} />
      <div className="relative min-h-screen flex flex-col justify-center px-6 bg-gradient-to-br from-background to-gray-50 dark:to-gray-900 overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute inset-0 overflow-hidden">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 10 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <Button
                  onClick={() => handleAuthRedirect('login')}
                  className="px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  {t('Sign In')}
                </Button>
                {registrationEnabled && (
                  <Button
                    onClick={() => handleAuthRedirect('register')}
                    className="px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    {t('Register')}
                  </Button>
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