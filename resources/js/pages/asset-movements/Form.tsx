import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';

interface AssetLite { id: number; serial_number?: string | null; brand?: string | null; model?: string | null; user_id?: number | null; current_location_id?: number | null }
interface UserLite { id: number; name: string }
interface LocationLite { id: number; name: string; type: 'company' | 'branch' | 'site' }

interface Props {
  assets: AssetLite[];
  users: UserLite[];
  locations: LocationLite[];
}

export default function AssetMovementForm({ assets, users, locations }: Props) {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors } = useForm<any>({
    asset_id: '',
    from_location_id: null as number | null,
    to_location_id: null as number | null,
    from_user_id: null as number | null,
    to_user_id: null as number | null,
    reason: '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Asset Movements'), href: '/asset-movements' },
    { title: t('New Movement'), href: '#' },
  ];

  const assetLabel = (a: AssetLite) => `${a.serial_number ?? ''} ${a.brand ?? ''} ${a.model ?? ''}`.trim() || `#${a.id}`;

  const selectedAsset = useMemo(() => assets.find(a => a.id === Number(data.asset_id)), [assets, data.asset_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData((prev: any) => ({
      ...prev,
      asset_id: Number(prev.asset_id),
      from_location_id: prev.from_location_id == null ? null : Number(prev.from_location_id),
      to_location_id: prev.to_location_id == null ? null : Number(prev.to_location_id),
      from_user_id: prev.from_user_id == null ? null : Number(prev.from_user_id),
      to_user_id: prev.to_user_id == null ? null : Number(prev.to_user_id),
    }));
    post('/asset-movements');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('New Movement')} />
      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('New Movement')}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset */}
              <div className="space-y-2">
                <Label htmlFor="asset_id">{t('Asset')}</Label>
                <Select
                  value={data.asset_id ? String(data.asset_id) : ''}
                  onValueChange={(v) => setData('asset_id', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select asset')} />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>{assetLabel(a)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.asset_id && <p className="text-sm text-red-500">{errors.asset_id}</p>}
              </div>

              {/* From Location / User (optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_location_id">{t('From Location')}</Label>
                  <Select
                    value={data.from_location_id ? String(data.from_location_id) : '-1'}
                    onValueChange={(v) => setData('from_location_id', v === '-1' ? null : Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('— None —')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {locations.map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>{l.name} ({l.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_user_id">{t('From User')}</Label>
                  <Select
                    value={data.from_user_id ? String(data.from_user_id) : '-1'}
                    onValueChange={(v) => setData('from_user_id', v === '-1' ? null : Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('— None —')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {users.map(u => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* To Location / User */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to_location_id">{t('To Location')}</Label>
                  <Select
                    value={data.to_location_id ? String(data.to_location_id) : '-1'}
                    onValueChange={(v) => setData('to_location_id', v === '-1' ? null : Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('— None —')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {locations.map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>{l.name} ({l.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to_user_id">{t('To User')}</Label>
                  <Select
                    value={data.to_user_id ? String(data.to_user_id) : '-1'}
                    onValueChange={(v) => setData('to_user_id', v === '-1' ? null : Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('— None —')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">{t('— None —')}</SelectItem>
                      {users.map(u => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">{t('Reason')}</Label>
                <Textarea id="reason" value={data.reason || ''} onChange={(e) => setData('reason', e.target.value)} />
                {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
              </div>

              <Separator />

              <div className="flex items-center justify-between pt-2">
                <Link href="/asset-movements">
                  <Button type="button" variant="secondary">
                    {t('Back')}
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? t('Submitting...') : t('Submit Request')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
