import React, { useCallback, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';
import { Plus, RotateCcw } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LoanRow {
  id: number;
  borrower?: { id: number; name: string } | null;
  loaned_by?: { id: number; name: string } | null;
  status: 'ongoing' | 'returned' | 'overdue' | 'cancelled';
  due_at?: string | null;
  returned_at?: string | null;
  items_count: number;
  created_at: string;
}

interface EmployeeLite { id: number; name: string }

interface Props {
  loans: {
    data: LoanRow[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  employees: EmployeeLite[];
  filters: { status?: string; borrower_user_id?: string };
}

export default function LoansIndex({ loans, employees, filters }: Props) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(filters.status || 'all');
  const [borrowerId, setBorrowerId] = useState(filters.borrower_user_id || 'all');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Loans'), href: '/loans' },
  ];

  const debouncedSearch = useCallback(
    debounce((params: any) => {
      router.get('/loans', params, { preserveState: true, preserveScroll: true });
    }, 400),
    []
  );

  const applyFilters = (key: string, value: string) => {
    const p = {
      status: status === 'all' ? undefined : status,
      borrower_user_id: borrowerId === 'all' ? undefined : borrowerId,
      [key]: value === 'all' ? undefined : value,
    };
    debouncedSearch(p);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Loans')} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {t('Loans')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('Track asset loans and returns by employees')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/loans/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('New Loan')}
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
                    <SelectItem value="ongoing">{t('Ongoing')}</SelectItem>
                    <SelectItem value="returned">{t('Returned')}</SelectItem>
                    <SelectItem value="overdue">{t('Overdue')}</SelectItem>
                    <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-80">
                <Select value={borrowerId} onValueChange={(v) => { setBorrowerId(v); applyFilters('borrower_user_id', v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Borrower')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Borrowers')}</SelectItem>
                    {employees.map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">#</TableHead>
                    <TableHead>{t('Borrower')}</TableHead>
                    <TableHead>{t('Items')}</TableHead>
                    <TableHead>{t('Due')}</TableHead>
                    <TableHead>{t('Returned')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        {t('No loans found')}
                      </TableCell>
                    </TableRow>
                  )}
                  {loans.data.map((l, idx) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-center">{(loans.current_page - 1) * 10 + idx + 1}</TableCell>
                      <TableCell>{l.borrower?.name || '-'}</TableCell>
                      <TableCell>{l.items_count}</TableCell>
                      <TableCell>{l.due_at || '-'}</TableCell>
                      <TableCell>{l.returned_at || '-'}</TableCell>
                      <TableCell className="capitalize">{l.status}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/loans/${l.id}`}>
                          <Button size="sm" variant="outline">
                            {t('Detail')}
                          </Button>
                        </Link>
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
