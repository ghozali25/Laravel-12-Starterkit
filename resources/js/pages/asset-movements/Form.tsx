import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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

  const [assetOpen, setAssetOpen] = React.useState(false);
  const [fromUserOpen, setFromUserOpen] = React.useState(false);
  const [toUserOpen, setToUserOpen] = React.useState(false);

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
              {/* Asset (Combobox) */}
              <div className="space-y-2">
                <Label htmlFor="asset_id">{t('Asset')}</Label>
                <Popover open={assetOpen} onOpenChange={setAssetOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={assetOpen} className="w-full justify-between">
                      {data.asset_id
                        ? assetLabel(assets.find(a => a.id === Number(data.asset_id)) as AssetLite)
                        : t('Select asset')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder={t('Search asset...')} />
                      <CommandList>
                        <CommandEmpty>{t('No results')}</CommandEmpty>
                        <CommandGroup>
                          {assets.map((a) => (
                            <CommandItem key={a.id} value={String(a.id)} onSelect={() => { setData('asset_id', Number(a.id)); setAssetOpen(false); }}>
                              {assetLabel(a)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                  <Popover open={fromUserOpen} onOpenChange={setFromUserOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={fromUserOpen} className="w-full justify-between">
                        {data.from_user_id ? (users.find(u => u.id === data.from_user_id)?.name || t('— None —')) : t('— None —')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder={t('Search user...')} />
                        <CommandList>
                          <CommandEmpty>{t('No results')}</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="-1" onSelect={() => { setData('from_user_id', null); setFromUserOpen(false); }}>
                              {t('— None —')}
                            </CommandItem>
                            {users.map(u => (
                              <CommandItem key={u.id} value={(u.name || String(u.id))} onSelect={() => { setData('from_user_id', Number(u.id)); setFromUserOpen(false); }}>
                                {u.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <Popover open={toUserOpen} onOpenChange={setToUserOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={toUserOpen} className="w-full justify-between">
                        {data.to_user_id ? (users.find(u => u.id === data.to_user_id)?.name || t('— None —')) : t('— None —')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder={t('Search user...')} />
                        <CommandList>
                          <CommandEmpty>{t('No results')}</CommandEmpty>
                          <CommandGroup>
                            <CommandItem value="-1" onSelect={() => { setData('to_user_id', null); setToUserOpen(false); }}>
                              {t('— None —')}
                            </CommandItem>
                            {users.map(u => (
                              <CommandItem key={u.id} value={(u.name || String(u.id))} onSelect={() => { setData('to_user_id', Number(u.id)); setToUserOpen(false); }}>
                                {u.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
