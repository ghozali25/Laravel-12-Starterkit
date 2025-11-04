import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';

interface ParentOption {
  id: number;
  name: string;
  type: 'company' | 'branch' | 'site';
}

interface LocationFormProps {
  location?: {
    id: number;
    parent_id: number | null;
    type: 'company' | 'branch' | 'site';
    code: string;
    name: string;
    address?: string | null;
    is_active: boolean;
  };
  parents: ParentOption[];
}

export default function LocationForm({ location, parents }: LocationFormProps) {
  const { t } = useTranslation();
  const isEdit = !!location;

  const { data, setData, post, put, processing, errors } = useForm<any>({
    parent_id: location?.parent_id ?? null,
    type: location?.type ?? 'site',
    code: location?.code ?? '',
    name: location?.name ?? '',
    address: location?.address ?? '',
    is_active: location?.is_active ?? true,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Locations'), href: '/locations' },
    { title: isEdit ? t('Edit Location') : t('Add Location'), href: '#' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(`/locations/${location?.id}`);
    } else {
      post('/locations');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? t('Edit Location') : t('Add Location')} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isEdit ? t('Edit Location') : t('Add New Location')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('Create or update a company, branch, or site')}
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Parent */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parent_id">{t('Parent Location')}</Label>
                  <Select
                    value={data.parent_id ? String(data.parent_id) : '-1'}
                    onValueChange={(value) => setData('parent_id', value === '-1' ? null : Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('— None —')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {parents.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} ({p.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.parent_id && <p className="text-sm text-red-500">{errors.parent_id}</p>}
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">{t('Type')}</Label>
                  <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">{t('Company')}</SelectItem>
                      <SelectItem value="branch">{t('Branch')}</SelectItem>
                      <SelectItem value="site">{t('Site')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">{t('Code')}</Label>
                  <Input
                    id="code"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                    placeholder="KRW"
                  />
                  {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                </div>

                {/* Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">{t('Name')}</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Karawaci"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">{t('Address')}</Label>
                  <Input
                    id="address"
                    value={data.address || ''}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder={t('Optional')}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>

                {/* Active */}
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Checkbox
                    id="is_active"
                    checked={!!data.is_active}
                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                  />
                  <Label htmlFor="is_active">{t('Active')}</Label>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Link href="/locations" className="w-full sm:w-auto">
                  <Button type="button" variant="secondary" className="w-full">
                    {t('Cancel')}
                  </Button>
                </Link>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                  {processing ? (isEdit ? t('Saving...') : t('Creating...')) : (isEdit ? t('Save Changes') : t('Create Location'))}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
