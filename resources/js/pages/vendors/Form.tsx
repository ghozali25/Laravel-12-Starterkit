import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';

interface Vendor { id?: number; name: string; contact_name?: string|null; email?: string|null; phone?: string|null; address?: string|null; notes?: string|null }

interface Props { vendor?: Vendor }

export default function VendorForm({ vendor }: Props) {
  const { t } = useTranslation();
  const isEdit = !!vendor?.id;

  const { data, setData, post, put, processing, errors } = useForm<any>({
    name: vendor?.name || '',
    contact_name: vendor?.contact_name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: vendor?.address || '',
    notes: vendor?.notes || '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Vendors'), href: '/vendors' },
    { title: isEdit ? t('Edit Vendor') : t('Add Vendor'), href: '#' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(`/vendors/${vendor!.id}`);
    } else {
      post('/vendors');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? t('Edit Vendor') : t('Add Vendor')} />
      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isEdit ? t('Edit Vendor') : t('Add Vendor')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('Name')}</Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="text-sm text-red-500">{String(errors.name)}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">{t('Contact Name')}</Label>
                  <Input id="contact_name" value={data.contact_name} onChange={(e) => setData('contact_name', e.target.value)} />
                  {errors.contact_name && <p className="text-sm text-red-500">{String(errors.contact_name)}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('Phone')}</Label>
                  <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                  {errors.phone && <p className="text-sm text-red-500">{String(errors.phone)}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('Email')}</Label>
                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                {errors.email && <p className="text-sm text-red-500">{String(errors.email)}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('Address')}</Label>
                <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                {errors.address && <p className="text-sm text-red-500">{String(errors.address)}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('Notes')}</Label>
                <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                {errors.notes && <p className="text-sm text-red-500">{String(errors.notes)}</p>}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link href="/vendors"><Button type="button" variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" /> {t('Back')}</Button></Link>
                <Button type="submit" disabled={processing}><Save className="mr-2 h-4 w-4" /> {processing ? t('Saving...') : t('Save')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
