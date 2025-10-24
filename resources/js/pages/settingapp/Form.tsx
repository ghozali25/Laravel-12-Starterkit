import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch'; // Import Switch component

const DEFAULT_WARNA = '#181818';

interface SettingApp {
  nama_app: string;
  deskripsi: string;
  warna: string;
  logo: string;
  favicon: string;
  background_image?: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  registration_enabled: boolean;
}

interface Props {
  setting: SettingApp | null;
}

export default function SettingForm({ setting }: Props) {
  const { t } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Application Settings'), href: '/settingsapp' },
  ];

  const { data, setData, post, processing, errors } = useForm({
    nama_app: setting?.nama_app || '',
    deskripsi: setting?.deskripsi || '',
    warna: setting?.warna || '#0ea5e9',
    seo: {
      title: setting?.seo?.title || '',
      description: setting?.seo?.description || '',
      keywords: setting?.seo?.keywords || '',
    },
    logo: null as File | null,
    favicon: null as File | null,
    background_image: null as File | null,
    remove_background_image: false as boolean,
    registration_enabled: setting?.registration_enabled ?? true,
  });

  const logoPreview = useRef<string | null>(setting?.logo ? `/storage/${setting.logo}` : null);
  const faviconPreview = useRef<string | null>(setting?.favicon ? `/storage/${setting.favicon}` : null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(
    setting?.background_image ? `/storage/${setting.background_image}` : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/settingsapp', {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImagePreview(null);
    setData('background_image', null);
    setData('remove_background_image', true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs} title={t('Application Settings')}>
      <Head title={t('Application Settings')} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">{t('Application Settings')}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">{t('Configure application identity, theme color, logo, and SEO metadata.')}</p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama App */}
              <div className="space-y-1">
                <Label htmlFor="nama_app">{t('Application Name')}</Label>
                <Input
                  id="nama_app"
                  value={data.nama_app}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama_app', e.target.value)}
                  className={errors.nama_app ? 'border-red-500' : ''}
                />
                {errors.nama_app && <p className="text-sm text-red-500">{errors.nama_app}</p>}
              </div>

              {/* Deskripsi */}
              <div className="space-y-1">
                <Label htmlFor="deskripsi">{t('Description')}</Label>
                <Textarea
                  id="deskripsi"
                  value={data.deskripsi}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('deskripsi', e.target.value)}
                />
              </div>

              {/* Warna Tema */}
              <div className="space-y-1">
                <Label htmlFor="warna">{t('Theme Color')}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="warna"
                    type="color"
                    value={data.warna}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('warna', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setData('warna', DEFAULT_WARNA)}
                  >
                    {t('Reset Default')}
                  </Button>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-1">
                <Label htmlFor="logo">{t('Logo (Max 2MB)')}</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0] || null;
                    setData('logo', file);
                    if (file) logoPreview.current = URL.createObjectURL(file);
                  }}
                />
                {logoPreview.current && (
                  <img src={logoPreview.current} alt="Preview Logo" className="mt-2 h-16 rounded" />
                )}
              </div>

              {/* Favicon Upload */}
              <div className="space-y-1">
                <Label htmlFor="favicon">{t('Favicon (Max 1MB)')}</Label>
                <Input
                  id="favicon"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0] || null;
                    setData('favicon', file);
                    if (file) faviconPreview.current = URL.createObjectURL(file);
                  }}
                />
                {faviconPreview.current && (
                  <img src={faviconPreview.current} alt="Preview Favicon" className="mt-2 h-10 rounded" />
                )}
              </div>

              {/* Background Image Upload */}
              <div className="space-y-1">
                <Label htmlFor="background_image">{t('Background Image (Max 2MB)')}</Label>
                <Input
                  id="background_image"
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0] || null;
                    setData('background_image', file);
                    setData('remove_background_image', false);
                    if (file) setBackgroundImagePreview(URL.createObjectURL(file));
                    else setBackgroundImagePreview(null);
                  }}
                />
                {backgroundImagePreview && (
                  <div className="relative mt-2 w-48 h-24 rounded overflow-hidden group">
                    <img src={backgroundImagePreview} alt="Preview Background" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveBackgroundImage}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Registration Enabled Switch */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="registration_enabled">{t('User Registration')}</Label>
                <Switch
                  id="registration_enabled"
                  checked={data.registration_enabled}
                  onCheckedChange={(checked) => setData('registration_enabled', checked)}
                  aria-label={t('Toggle user registration')}
                />
                {errors.registration_enabled && <p className="text-sm text-red-500 mt-2">{errors.registration_enabled}</p>}
              </div>

              {/* SEO Section */}
              <Separator />
              <h3 className="text-lg font-semibold">{t('SEO Settings')}</h3>

              <div className="space-y-1">
                <Label htmlFor="seo_title">{t('SEO Title')}</Label>
                <Input
                  id="seo_title"
                  value={data.seo.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('seo', { ...data.seo, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="seo_description">{t('SEO Description')}</Label>
                <Textarea
                  id="seo_description"
                  value={data.seo.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('seo', { ...data.seo, description: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="seo_keywords">{t('SEO Keywords (separate with commas)')}</Label>
                <Input
                  id="seo_keywords"
                  value={data.seo.keywords}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('seo', { ...data.seo, keywords: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={processing} className="px-6">
                  {processing ? t('Saving...') : t('Save Settings')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}