import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Vendor { id: number; name: string; contact_name?: string|null; email?: string|null; phone?: string|null }

interface Props {
  vendors: {
    data: Vendor[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: { search?: string };
}

export default function VendorIndex({ vendors, filters }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');

  const breadcrumbs: BreadcrumbItem[] = [ { title: t('Vendors'), href: '/vendors' } ];

  const handleDelete = (id: number) => {
    router.delete(`/vendors/${id}`, { preserveScroll: true });
  };

  const doSearch = () => {
    router.get('/vendors', { search }, { preserveState: true, preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Vendors')} />
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{t('Vendors')}</CardTitle>
            </div>
            <Link href="/vendors/create">
              <Button className="gap-2"><Plus className="h-4 w-4" /> {t('Add')}</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search vendors...')} />
              <Button variant="secondary" onClick={doSearch}>{t('Search')}</Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">{t('No')}</TableHead>
                    <TableHead>{t('Name')}</TableHead>
                    <TableHead>{t('Contact')}</TableHead>
                    <TableHead>{t('Email')}</TableHead>
                    <TableHead>{t('Phone')}</TableHead>
                    <TableHead className="text-center">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">{t('No data')}</TableCell>
                    </TableRow>
                  ) : vendors.data.map((v, idx) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-center">{(vendors.current_page - 1) * 10 + idx + 1}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.contact_name || '-'}</TableCell>
                      <TableCell>{v.email || '-'}</TableCell>
                      <TableCell>{v.phone || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/vendors/${v.id}/edit`}><Button size="sm" variant="outline"><Edit className="h-4 w-4 mr-1" /> {t('Edit')}</Button></Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" /> {t('Delete')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('Delete vendor?')}</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(v.id)}>{t('Yes, Delete')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
