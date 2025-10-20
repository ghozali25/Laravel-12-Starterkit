import React, { useState, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem, type AssetCategory } from '@/types';
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

interface Props {
  categories: {
    data: AssetCategory[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search?: string;
  };
}

export default function AssetCategoryIndex({ categories, filters }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('Asset Categories'),
      href: '/asset-categories',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/asset-categories/${id}`, {
      onSuccess: () => toast.success(t('Asset category deleted successfully.')),
      onError: (errors) => {
        if (errors.error) {
          toast.error(errors.error);
        } else {
          toast.error(t('Failed to delete asset category.'));
        }
      },
      preserveScroll: true,
    });
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/asset-categories', { search: value }, { preserveState: true, preserveScroll: true });
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
      <Head title={t('Asset Categories')} />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{t('Asset Categories')}</CardTitle>
              <p className="text-muted-foreground text-sm">{t('Manage categories for assets, including custom fields.')}</p>
            </div>
            <Link href="/asset-categories/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Category')}
              </Button>
            </Link>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t('Search categories...')}
                value={search}
                onChange={handleSearchChange}
              />
              <Button onClick={() => debouncedSearch(search)} variant="secondary">
                <FileSearch className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {categories.data.length === 0 ? (
                <p className="text-muted-foreground text-center">{t('No data available.')}</p>
              ) : (
                categories.data.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between border px-4 py-3 rounded-md bg-muted/50 hover:bg-muted/70 transition"
                  >
                    <div className="font-medium text-sm text-foreground">{category.name}</div>
                    <div className="flex items-center gap-2">
                      <Link href={`/asset-categories/${category.id}/edit`}>
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
                            <AlertDialogTitle>{t('Delete this category?')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('Category')} <strong>{category.name}</strong> {t('will be permanently deleted.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(category.id)}
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
            {categories.links.length > 1 && (
              <div className="flex justify-center pt-6 flex-wrap gap-2">
                {categories.links.map((link, i) => (
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