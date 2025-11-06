import React, { useCallback, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';
import { Plus, Check, X } from 'lucide-react';
import { debounce } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface MovementItem {
  id: number;
  asset?: { id: number; label: string } | null;
  from_location?: { id: number; name: string; type: string } | null;
  to_location?: { id: number; name: string; type: string } | null;
  from_user?: { id: number; name: string } | null;
  to_user?: { id: number; name: string } | null;
  reason?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
}

interface AssetLite { id: number; serial_number?: string | null; brand?: string | null; model?: string | null }

interface Props {
  movements: {
    data: MovementItem[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  assets: AssetLite[];
  filters: { status?: string; asset_id?: string };
}

export default function AssetMovementsIndex({ movements, assets, filters }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(filters.status || 'all');
  const [assetId, setAssetId] = useState(filters.asset_id || 'all');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Asset Movements'), href: '/asset-movements' },
  ];

  const debouncedSearch = useCallback(
    debounce((params: any) => {
      router.get('/asset-movements', params, { preserveState: true, preserveScroll: true });
    }, 400),
    []
  );

  const applyFilters = (key: string, value: string) => {
    const p = {
      status: status === 'all' ? undefined : status,
      asset_id: assetId === 'all' ? undefined : assetId,
      [key]: value === 'all' ? undefined : value,
    };
    debouncedSearch(p);
  };

  const handleApprove = (id: number) => router.post(`/asset-movements/${id}/approve`);
  const handleReject = (id: number) => router.post(`/asset-movements/${id}/reject`);

  const assetLabel = (a: AssetLite) => `${a.serial_number ?? ''} ${a.brand ?? ''} ${a.model ?? ''}`.trim() || `#${a.id}`;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Asset Movements')} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {t('Asset Movements')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('Request and approve asset transfers between locations or users')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/asset-movements/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('New Movement')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="w-full md:w-60">
                <Select value={status} onValueChange={(v) => { setStatus(v); applyFilters('status', v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Status')}</SelectItem>
                    <SelectItem value="pending">{t('Pending')}</SelectItem>
                    <SelectItem value="approved">{t('Approved')}</SelectItem>
                    <SelectItem value="rejected">{t('Rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-80">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {assetId !== 'all' && assetId
                        ? assetLabel(assets.find(a => String(a.id) === assetId) as AssetLite)
                        : t('All Assets')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder={t('Search asset...')} />
                      <CommandList>
                        <CommandEmpty>{t('No results')}</CommandEmpty>
                        <CommandGroup>
                          <CommandItem value="all" onSelect={() => { setAssetId('all'); applyFilters('asset_id', 'all'); }}>
                            {t('All Assets')}
                          </CommandItem>
                          {assets.map((a) => (
                            <CommandItem key={a.id} value={String(a.id)} onSelect={() => { setAssetId(String(a.id)); applyFilters('asset_id', String(a.id)); }}>
                              {assetLabel(a)}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">#</TableHead>
                    <TableHead>{t('Asset')}</TableHead>
                    <TableHead>{t('From')}</TableHead>
                    <TableHead>{t('To')}</TableHead>
                    <TableHead>{t('Reason')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        {t('No movement requests')}
                      </TableCell>
                    </TableRow>
                  )}
                  {movements.data.map((m, idx) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-center">{(movements.current_page - 1) * 10 + idx + 1}</TableCell>
                      <TableCell>{m.asset?.label || '-'}</TableCell>
                      <TableCell>
                        {m.from_location ? `${m.from_location.name} (${m.from_location.type})` : m.from_user?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {m.to_location ? `${m.to_location.name} (${m.to_location.type})` : m.to_user?.name || '-'}
                      </TableCell>
                      <TableCell>{m.reason || '-'}</TableCell>
                      <TableCell className="capitalize">{m.status}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {m.status === 'pending' && (
                          <>
                            <Button size="icon" variant="outline" onClick={() => handleApprove(m.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => handleReject(m.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
