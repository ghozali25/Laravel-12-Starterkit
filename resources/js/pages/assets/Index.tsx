import React, { useState, useCallback, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem, type Asset, type AssetCategory, type User } from '@/types';
import { Plus, Edit, Trash2, FileSearch, Laptop } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { debounce } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

interface Props {
  assets: {
    data: Asset[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  categories: AssetCategory[];
  employees: User[];
  filters: {
    search?: string;
    category_id?: string;
    user_id?: string;
  };
}

export default function AssetIndex({ assets, categories, employees, filters }: Props) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(filters.category_id || 'all');
  const [selectedUserFilter, setSelectedUserFilter] = useState(filters.user_id || 'all');

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('Assets List'),
      href: '/assets',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/assets/${id}`, {
      onSuccess: () => toast.success(t('Asset deleted successfully.')),
      onError: () => toast.error(t('Failed to delete asset.')),
      preserveScroll: true,
    });
  };

  const debouncedSearch = useCallback(
    debounce((searchValue: string, categoryId: string, userId: string) => {
      router.get('/assets', {
        search: searchValue,
        category_id: categoryId === 'all' ? '' : categoryId,
        user_id: userId === 'all' ? '' : userId,
      }, { preserveState: true, preserveScroll: true });
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value, selectedCategoryFilter, selectedUserFilter);
  };

  const handleCategoryFilterChange = (value: string) => {
    setSelectedCategoryFilter(value);
    debouncedSearch(search, value, selectedUserFilter);
  };

  const handleUserFilterChange = (value: string) => {
    setSelectedUserFilter(value);
    debouncedSearch(search, selectedCategoryFilter, value);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Assets List')} />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{t('Assets List')}</CardTitle>
              <p className="text-muted-foreground text-sm">{t('Manage all company assets and their assignments.')}</p>
            </div>
            <Link href="/assets/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Asset')}
              </Button>
            </Link>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-6">
            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-center gap-2">
              <Input
                type="text"
                placeholder={t('Search assets...')}
                value={search}
                onChange={handleSearchChange}
              />
              <Select
                value={selectedCategoryFilter}
                onValueChange={handleCategoryFilterChange}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t('Filter by Category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Categories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedUserFilter}
                onValueChange={handleUserFilterChange}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t('Filter by Employee')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Employees')}</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => debouncedSearch(search, selectedCategoryFilter, selectedUserFilter)} variant="secondary">
                <FileSearch className="h-4 w-4" />
              </Button>
            </div>

            {/* Assets Table */}
            <div className="rounded-md border bg-background overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Category')}</TableHead>
                    <TableHead>{t('Serial Number')}</TableHead>
                    <TableHead>{t('Brand')}</TableHead>
                    <TableHead>{t('Model')}</TableHead>
                    <TableHead>{t('Assigned To')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead>{t('Last Used')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        {t('No asset data available.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.data.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.category?.name || '-'}</TableCell>
                        <TableCell>{asset.serial_number || '-'}</TableCell>
                        <TableCell>{asset.brand || '-'}</TableCell>
                        <TableCell>{asset.model || '-'}</TableCell>
                        <TableCell>{asset.user?.name || '-'}</TableCell>
                        <TableCell>{t(asset.status)}</TableCell>
                        <TableCell>{asset.last_used_at || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/assets/${asset.id}/edit`}>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" /> {t('Edit')}
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4 mr-1" /> {t('Delete')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('Delete Asset?')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('Asset')} <strong>{asset.serial_number || asset.model}</strong> {t('will be permanently deleted.')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(asset.id)}
                                    disabled={false}
                                  >
                                    {t('Yes, Delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {assets.links.length > 1 && (
              <div className="flex justify-center pt-6 flex-wrap gap-2">
                {assets.links.map((link, i) => (
                  <Button
                    key={i}
                    disabled={!link.url}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.visit(link.url || '', { preserveScroll: true })}
                  >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}