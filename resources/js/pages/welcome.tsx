import React, { useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
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
        className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden bg-[#4f46e5] bg-cover bg-center"
        style={{ backgroundImage: "url('/background.webp')" }}
      >
        {/* MAIN LAYOUT */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto w-full">
          {/* LEFT SIDE - TEXT/CTA */}
          <div className="text-center lg:text-left space-y-8 px-4 md:px-8">
            <div className="flex justify-center lg:justify-start items-center">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 flex items-center">
                {t('Welcome')}
              </h1>
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
          {/* RIGHT SIDE - EMPTY (reserved for future illustration) */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </>
  );
}