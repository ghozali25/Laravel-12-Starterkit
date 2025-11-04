import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LoanLite {
  id: number;
  borrower?: { id: number; name: string } | null;
  loaned_by?: { id: number; name: string } | null;
  status: string;
  due_at?: string | null;
  returned_at?: string | null;
  notes?: string | null;
  created_at: string;
}

interface LoanItemLite {
  id: number;
  asset?: { id: number; serial_number?: string | null; brand?: string | null; model?: string | null } | null;
  condition_out?: string | null;
  condition_in?: string | null;
  returned_at?: string | null;
}

interface Props {
  loan: LoanLite;
  items: LoanItemLite[];
}

export default function LoanShow({ loan, items }: Props) {
  const { t } = useTranslation();
  const [returnNotes, setReturnNotes] = useState<Record<number, string>>({});

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Loans'), href: '/loans' },
    { title: `#${loan.id}`, href: '#' },
  ];

  const assetLabel = (a?: LoanItemLite['asset']) => `${a?.serial_number ?? ''} ${a?.brand ?? ''} ${a?.model ?? ''}`.trim() || `#${a?.id}`;

  const submitReturn = (itemId: number) => {
    router.post(`/loan-items/${itemId}/return`, { condition_in: returnNotes[itemId] || '' });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Loan #${loan.id}`} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {t('Loan Detail')} #{loan.id}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('Borrower')}: {loan.borrower?.name || '-'} — {t('Status')}: {loan.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/loans">
                  <Button variant="secondary">{t('Back')}</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">#</TableHead>
                    <TableHead>{t('Asset')}</TableHead>
                    <TableHead>{t('Condition Out')}</TableHead>
                    <TableHead>{t('Condition In')}</TableHead>
                    <TableHead>{t('Returned At')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {t('No items')}
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((it, idx) => (
                    <TableRow key={it.id}>
                      <TableCell className="text-center">{idx + 1}</TableCell>
                      <TableCell>{assetLabel(it.asset)}</TableCell>
                      <TableCell>{it.condition_out || '-'}</TableCell>
                      <TableCell>
                        {it.returned_at ? (
                          it.condition_in || '-'
                        ) : (
                          <Input
                            placeholder={t('Enter condition')}
                            value={returnNotes[it.id] || ''}
                            onChange={(e) => setReturnNotes({ ...returnNotes, [it.id]: e.target.value })}
                          />
                        )}
                      </TableCell>
                      <TableCell>{it.returned_at || '-'}</TableCell>
                      <TableCell className="text-right">
                        {!it.returned_at && (
                          <Button size="sm" onClick={() => submitReturn(it.id)}>
                            {t('Return')}
                          </Button>
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
