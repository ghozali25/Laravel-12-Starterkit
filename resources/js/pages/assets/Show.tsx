import React, { useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem, type Asset } from '@/types';
import { useTranslation } from '@/lib/i18n';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

interface MovementItem {
  id: number;
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

interface Props {
  asset: Asset & {
    current_location?: { id: number; name: string; type: string } | null;
    vendor?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
  };
  movements: {
    data: MovementItem[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
}

export default function AssetShow({ asset, movements }: Props) {
  const { t, locale } = useTranslation();
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Assets List'), href: '/assets' },
    { title: `${asset.serial_number || asset.model || asset.brand || '#' + asset.id}`, href: '#' },
  ];

  const renderFrom = (m: MovementItem) => {
    if (m.from_location) return `${m.from_location.name} (${m.from_location.type})`;
    if (m.from_user) return m.from_user.name;
    return '-';
  };

  const renderTo = (m: MovementItem) => {
    if (m.to_location) return `${m.to_location.name} (${m.to_location.type})`;
    if (m.to_user) return m.to_user.name;
    return '-';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Asset Detail')} />
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{t('Asset Detail')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {asset.serial_number || asset.model || asset.brand || `#${asset.id}`}
                </p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Link href={`/assets/${asset.id}/edit`}>
                    <Button variant="outline">{t('Edit')}</Button>
                  </Link>
                )}
                <Link href="/assets">
                  <Button variant="secondary">{t('Back')}</Button>
                </Link>
              </div>
            </div>
            <Tabs.Root defaultValue="detail" className="mt-4">
              <Tabs.List className="inline-flex items-center gap-2 rounded-lg bg-muted p-1">
                <Tabs.Trigger
                  value="detail"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('Detail')}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="history"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground rounded-md px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {t('History')}
                </Tabs.Trigger>
              </Tabs.List>
            
              <Separator className="my-4" />
            
              <Tabs.Content value="detail">
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">{t('Category')}</div>
                      <div className="text-muted-foreground">{asset.category?.name || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Serial Number')}</div>
                      <div className="text-muted-foreground">{asset.serial_number || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Brand')}</div>
                      <div className="text-muted-foreground">{asset.brand || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Model')}</div>
                      <div className="text-muted-foreground">{asset.model || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Assigned To')}</div>
                      <div className="text-muted-foreground">{asset.user?.name || '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Vendor')}</div>
                      <div className="text-muted-foreground">{(asset as any).vendor ? (asset as any).vendor.name : '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Location')}</div>
                      <div className="text-muted-foreground">{(asset as any).current_location ? `${(asset as any).current_location.name} (${(asset as any).current_location.type})` : '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Status')}</div>
                      <div className="text-muted-foreground">{t(asset.status)}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{t('Last Used')}</div>
                      <div className="text-muted-foreground">{asset.last_used_at || '-'}</div>
                    </div>
                  </div>
                </CardContent>
              </Tabs.Content>

              <Tabs.Content value="history">
                <CardContent className="pt-0 space-y-4">
                  <div className="rounded-md border bg-background overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-center">{t('No')}</TableHead>
                          <TableHead>{t('From')}</TableHead>
                          <TableHead>{t('To')}</TableHead>
                          <TableHead>{t('Reason')}</TableHead>
                          <TableHead>{t('Status')}</TableHead>
                          <TableHead>{t('Requested By')}</TableHead>
                          <TableHead>{t('Approved By')}</TableHead>
                          <TableHead>{t('Created At')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.data.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                              {t('No history available.')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          movements.data.map((m, idx) => (
                            <TableRow key={m.id}>
                              <TableCell className="font-medium text-muted-foreground text-center">
                                {(movements.current_page - 1) * 10 + idx + 1}
                              </TableCell>
                              <TableCell>{renderFrom(m)}</TableCell>
                              <TableCell>{renderTo(m)}</TableCell>
                              <TableCell>{m.reason || '-'}</TableCell>
                              <TableCell className="capitalize">{m.status}</TableCell>
                              <TableCell>{m.requested_by || '-'}</TableCell>
                              <TableCell>{m.approved_by || '-'}</TableCell>
                              <TableCell>{m.created_at}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {movements.links && movements.links.length > 1 && (
                    <div className="flex justify-center items-center pt-2 flex-wrap gap-2">
                      {movements.links.map((link, i) => (
                        <Button
                          key={i}
                          disabled={!link.url}
                          variant={link.active ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                        >
                          <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Tabs.Content>
            </Tabs.Root>
          </CardHeader>
          <Separator />
        </Card>
      </div>
    </AppLayout>
  );
}
