import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';

interface EmployeeLite { id: number; name: string }
interface AssetLite { id: number; serial_number?: string | null; brand?: string | null; model?: string | null }

interface Props {
  employees: EmployeeLite[];
  assets: AssetLite[];
  defaults: { loaned_by_user_id: number };
}

export default function LoanForm({ employees, assets, defaults }: Props) {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors } = useForm<any>({
    borrower_user_id: '',
    loaned_by_user_id: defaults.loaned_by_user_id,
    due_at: '',
    notes: '',
    asset_ids: [] as number[],
  });

  const [assetSelection, setAssetSelection] = useState<string>('');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Loans'), href: '/loans' },
    { title: t('New Loan'), href: '#' },
  ];

  const assetLabel = (a: AssetLite) => `${a.serial_number ?? ''} ${a.brand ?? ''} ${a.model ?? ''}`.trim() || `#${a.id}`;

  const addAsset = () => {
    if (!assetSelection) return;
    const id = Number(assetSelection);
    if (!data.asset_ids.includes(id)) setData('asset_ids', [...data.asset_ids, id]);
    setAssetSelection('');
  };

  const removeAsset = (id: number) => setData('asset_ids', data.asset_ids.filter((x: number) => x !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/loans');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('New Loan')} />
      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('New Loan')}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Borrower */}
                <div className="space-y-2">
                  <Label htmlFor="borrower_user_id">{t('Borrower')}</Label>
                  <Select value={data.borrower_user_id ? String(data.borrower_user_id) : ''} onValueChange={(v) => setData('borrower_user_id', Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select borrower')} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(u => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.borrower_user_id && <p className="text-sm text-red-500">{errors.borrower_user_id}</p>}
                </div>

                {/* Loaned by (read-only selection) */}
                <div className="space-y-2">
                  <Label htmlFor="loaned_by_user_id">{t('Loaned By')}</Label>
                  <Select value={String(data.loaned_by_user_id)} onValueChange={(v) => setData('loaned_by_user_id', Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select staff')} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(u => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.loaned_by_user_id && <p className="text-sm text-red-500">{errors.loaned_by_user_id}</p>}
                </div>
              </div>

              {/* Due date */}
              <div className="space-y-2">
                <Label htmlFor="due_at">{t('Due Date')}</Label>
                <Input id="due_at" type="datetime-local" value={data.due_at || ''} onChange={(e) => setData('due_at', e.target.value)} />
                {errors.due_at && <p className="text-sm text-red-500">{errors.due_at}</p>}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t('Notes')}</Label>
                <Textarea id="notes" value={data.notes || ''} onChange={(e) => setData('notes', e.target.value)} />
                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
              </div>

              {/* Asset selector */}
              <div className="space-y-2">
                <Label>{t('Assets to Loan')}</Label>
                <div className="flex items-center gap-2">
                  <Select value={assetSelection} onValueChange={(v) => setAssetSelection(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('Select asset')} />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map(a => (
                        <SelectItem key={a.id} value={String(a.id)}>{assetLabel(a)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addAsset}>{t('Add')}</Button>
                </div>
                {errors.asset_ids && <p className="text-sm text-red-500">{errors.asset_ids}</p>}

                {data.asset_ids.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    {data.asset_ids.map((id: number) => {
                      const a = assets.find(x => x.id === id);
                      return (
                        <li key={id} className="flex items-center justify-between">
                          <span>{a ? assetLabel(a) : `#${id}`}</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeAsset(id)}>
                            {t('Remove')}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <Separator />
              <div className="flex items-center justify-between pt-2">
                <Link href="/loans">
                  <Button type="button" variant="secondary">{t('Back')}</Button>
                </Link>
                <Button type="submit" disabled={processing}>{processing ? t('Submitting...') : t('Create Loan')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
