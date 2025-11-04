import React, { useState, useCallback, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';
import { Plus, Edit, Trash2, FileSearch } from 'lucide-react';
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

interface LocationItem {
  id: number;
  parent_id?: number | null;
  type: 'company' | 'branch' | 'site';
  code: string;
  name: string;
  address?: string | null;
  is_active: boolean;
}

interface Props {
  locations: {
    data: LocationItem[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  parents: { id: number; name: string; type: 'company' | 'branch' | 'site' }[];
  filters: { type?: string; search?: string };
}

export default function LocationIndex({ locations, parents, filters }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');
  const [type, setType] = useState(filters.type || 'all');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Locations'), href: '/locations' },
  ];

  const debouncedSearch = useCallback(
    debounce((params: any) => {
      router.get('/locations', params, { preserveState: true, preserveScroll: true });
    }, 500),
    []
  );

  const handleFilterChange = (key: string, value: string) => {
    const params = {
      search,
      type: type === 'all' ? undefined : type,
      [key]: value === 'all' ? undefined : value,
    };
    debouncedSearch(params);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    handleFilterChange('search', value);
  };

  const handleDelete = (id: number) => {
    router.delete(`/locations/${id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Locations')} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {t('Locations')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('Manage companies, branches, and sites')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/locations/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('Add Location')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="w-full md:w-80">
                <Input
                  placeholder={t('Search by name or code')}
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="w-full md:w-60">
                <Select value={type} onValueChange={(v) => { setType(v); handleFilterChange('type', v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Types')}</SelectItem>
                    <SelectItem value="company">{t('Company')}</SelectItem>
                    <SelectItem value="branch">{t('Branch')}</SelectItem>
                    <SelectItem value="site">{t('Site')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] text-center">#</TableHead>
                    <TableHead>{t('Code')}</TableHead>
                    <TableHead>{t('Name')}</TableHead>
                    <TableHead>{t('Type')}</TableHead>
                    <TableHead>{t('Address')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {t('No locations found')}
                      </TableCell>
                    </TableRow>
                  )}
                  {locations.data.map((loc, idx) => (
                    <TableRow key={loc.id}>
                      <TableCell className="text-center">{(locations.current_page - 1) * 10 + idx + 1}</TableCell>
                      <TableCell>{loc.code}</TableCell>
                      <TableCell>{loc.name}</TableCell>
                      <TableCell className="capitalize">{loc.type}</TableCell>
                      <TableCell>{loc.address || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/locations/${loc.id}/edit`}>
                          <Button size="icon" variant="ghost" className="mr-1">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(loc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
