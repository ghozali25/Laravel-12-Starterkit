import React, { useState, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem, type Division } from '@/types';
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
  divisions: {
    data: Division[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search?: string;
  };
}

export default function DivisionIndex({ divisions, filters }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('Division Management'),
      href: '/divisions',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/divisions/${id}`, {
      onSuccess: () => toast.success(t('Division deleted successfully.')),
      onError: (errors) => {
        if (errors.error) {
          toast.error(errors.error);
        } else {
          toast.error(t('Failed to delete division.'));
        }
      },
      preserveScroll: true,
    });
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/divisions', { search: value }, { preserveState: true, preserveScroll: true });
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
      <Head title={t('Division Management')} />
      <div className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{t('Divisions')}</CardTitle>
              <p className="text-muted-foreground text-sm">{t('Manage company divisions')}</p>
            </div>
            <Link href="/divisions/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Division')}
              </Button>
            </Link>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-6">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t('Search divisions...')}
                value={search}
                onChange={handleSearchChange}
              />
              <Button onClick={() => debouncedSearch(search)} variant="secondary">
                <FileSearch className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {divisions.data.length === 0 ? (
                <p className="text-muted-foreground text-center">{t('No data available.')}</p>
              ) : (
                divisions.data.map((division) => (
                  <div
                    key={division.id}
                    className="flex items-center justify-between border px-4 py-3 rounded-md bg-muted/50 hover:bg-muted/70 transition"
                  >
                    <div className="font-medium text-sm text-foreground">{division.name}</div>
                    <div className="flex items-center gap-2">
                      <Link href={`/divisions/${division.id}/edit`}>
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
                            <AlertDialogTitle>{t('Delete this division?')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('Division')} <strong>{division.name}</strong> {t('will be permanently deleted.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(division.id)}
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
            {divisions.links.length > 1 && (
              <div className="flex justify-center pt-6 flex-wrap gap-2">
                {divisions.links.map((link, i) => (
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