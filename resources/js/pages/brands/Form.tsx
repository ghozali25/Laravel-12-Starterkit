import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, ArrowLeft } from 'lucide-react';
import { BreadcrumbItem, type Brand } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface BrandFormProps {
  brand?: Brand;
}

export default function BrandForm({ brand }: BrandFormProps) {
  const { t } = useTranslation();
  const isEdit = !!brand;

  const { data, setData, processing, errors } = useForm({
    name: brand?.name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      router.put(`/brands/${brand?.id}`, data);
    } else {
      router.post('/brands', data);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Brand Management'), href: '/brands' },
    { title: isEdit ? t('Edit Brand') : t('Add Brand'), href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? t('Edit Brand') : t('Add Brand')} />

      <div className="flex-1 p-4 md:p-6 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEdit ? t('Edit Brand') : t('Add Brand')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isEdit ? t('Edit brand details') : t('Create a new brand')}
            </p>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('Brand Name')}</Label>
                <Input
                  id="name"
                  placeholder="Example: HP, Samsung, Toyota"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Link href="/brands">
                  <Button type="button" variant="secondary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('Back')}
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} >
                  <Save className="mr-2 h-4 w-4" />
                  {processing
                    ? isEdit
                      ? t('Saving...')
                      : t('Adding...')
                    : isEdit
                    ? t('Save Changes')
                    : t('Add')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}