import React, { useState, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem, type Brand } from '@/types';
import { Plus, Edit, Trash2, FileSearch } from 'lucide-react';
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

interface Props {
  brands: {
    data: Brand[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search?: string;
  };
}

export default function BrandIndex({ brands, filters }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');

  const notify = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const S: any = (window as any).Swal;
    if (!S) return;
    const toast = S.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, timerProgressBar: true });
    toast.fire({ icon: type, title: message });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('Brand Management'),
      href: '/brands',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/brands/${id}`, {
      onSuccess: () => notify('success', t('Brand deleted successfully.')),
      onError: (errors) => {
        if (errors.error) {
          notify('error', errors.error);
        } else {
          notify('error', t('Failed to delete brand.'));
        }
      },
      preserveScroll: true,
    });
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/brands', { search: value }, { preserveState: true, preserveScroll: true });
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Brand Management')} />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{t('Brands')}</CardTitle>
              <p className="text-muted-foreground text-sm">{t('Manage product brands for assets')}</p>
            </div>
            <Link href="/brands/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Brand')}
              </Button>
            </Link>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t('Search brands...')}
                value={search}
                onChange={handleSearchChange}
              />
              <Button onClick={() => debouncedSearch(search)} variant="secondary">
                <FileSearch className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {brands.data.length === 0 ? (
                <p className="text-muted-foreground text-center">{t('No data available.')}</p>
              ) : (
                brands.data.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between border px-4 py-3 rounded-md bg-muted/50 hover:bg-muted/70 transition"
                  >
                    <div className="font-medium text-sm text-foreground">{brand.name}</div>
                    <div className="flex items-center gap-2">
                      <Link href={`/brands/${brand.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('Delete this brand?')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('Brand')} <strong>{brand.name}</strong> {t('will be permanently deleted.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(brand.id)}
                            >
                              {t('Delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {brands.links.length > 1 && (
              <div className="flex justify-center pt-6 flex-wrap gap-2">
                {brands.links.map((link, i) => (
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