import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { UploadButton } from '@/components/ui/upload-button';
import { type BreadcrumbItem, type Asset, type AssetCategory, type User } from '@/types';
import { Plus, Edit, Trash2, FileSearch, FileDown, FileUp, FileSpreadsheet, FileType, Printer, FileQuestion } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

interface LocationLite { id: number; name: string; type: 'company' | 'branch' | 'site' }

interface Props {
  assets: {
    data: Asset[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  categories: AssetCategory[];
  employees: User[];
  locations: LocationLite[];
  filters: {
    search?: string;
    category_id?: string;
    user_id?: string;
    location_id?: string;
  };
}

export default function AssetIndex({ assets, categories, employees, locations, filters }: Props) {
  const { t, locale } = useTranslation();
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);

  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(filters.category_id || 'all');
  const [selectedUserFilter, setSelectedUserFilter] = useState(filters.user_id || 'all');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState(filters.location_id || 'all');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProcessing, setImportProcessing] = useState(false);
  const [empQuery, setEmpQuery] = useState('');
  const [locQuery, setLocQuery] = useState('');

  // Local debounced handlers for combobox queries
  const setEmpQueryDebounced = useCallback(
    debounce((v: string) => setEmpQuery(v), 200),
    []
  );
  const setLocQueryDebounced = useCallback(
    debounce((v: string) => setLocQuery(v), 200),
    []
  );

  const filteredEmployees = useMemo(() => {
    const q = empQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e: any) => (e.name || '').toLowerCase().includes(q));
  }, [employees, empQuery]);

  const filteredLocations = useMemo(() => {
    const q = locQuery.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l: any) => `${l.name} ${l.type}`.toLowerCase().includes(q));
  }, [locations, locQuery]);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  const notify = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const S: any = (window as any).Swal;
    if (!S) return;
    const toast = S.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, timerProgressBar: true });
    toast.fire({ icon: type, title: message });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('Assets List'),
      href: '/assets',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/assets/${id}`, {
      onSuccess: () => notify('success', t('Asset deleted successfully.')),
      onError: () => notify('error', t('Failed to delete asset.')),
      preserveScroll: true,
    });
  };

  const debouncedSearch = useCallback(
    debounce((searchValue: string, categoryId: string, userId: string, locationId: string) => {
      router.get('/assets', {
        search: searchValue,
        category_id: categoryId === 'all' ? '' : categoryId,
        user_id: userId === 'all' ? '' : userId,
        location_id: locationId === 'all' ? '' : locationId,
      }, { preserveState: true, preserveScroll: true });
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value, selectedCategoryFilter, selectedUserFilter, selectedLocationFilter);
  };

  const handleCategoryFilterChange = (value: string) => {
    setSelectedCategoryFilter(value);
    router.get('/assets', {
      search,
      category_id: value === 'all' ? '' : value,
      user_id: selectedUserFilter === 'all' ? '' : selectedUserFilter,
      location_id: selectedLocationFilter === 'all' ? '' : selectedLocationFilter,
    }, { preserveState: true, preserveScroll: true });
  };

  const handleUserPick = (value: string) => {
    setSelectedUserFilter(value);
    router.get('/assets', {
      search,
      category_id: selectedCategoryFilter === 'all' ? '' : selectedCategoryFilter,
      user_id: value === 'all' ? '' : value,
      location_id: selectedLocationFilter === 'all' ? '' : selectedLocationFilter,
    }, { preserveState: true, preserveScroll: true });
  };

  const handleLocationPick = (value: string) => {
    setSelectedLocationFilter(value);
    router.get('/assets', {
      search,
      category_id: selectedCategoryFilter === 'all' ? '' : selectedCategoryFilter,
      user_id: selectedUserFilter === 'all' ? '' : selectedUserFilter,
      location_id: value === 'all' ? '' : value,
    }, { preserveState: true, preserveScroll: true });
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    } else {
      setImportFile(null);
    }
  };

  const handleImportSubmit = () => {
    if (!importFile) {
      notify('error', t('Please select a file to import.'));
      return;
    }

    setImportProcessing(true);
    const formData = new FormData();
    formData.append('file', importFile);

    router.post('/assets/import', formData, {
      forceFormData: true,
      onSuccess: () => {
        notify('success', t('Assets imported successfully.'));
        setIsImportDialogOpen(false);
        setImportFile(null);
        router.reload({ only: ['assets'] });
      },
      onError: (errors) => {
        notify('error', t('Failed to import assets.'));
        console.error(errors);
      },
      onFinish: () => setImportProcessing(false),
    });
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
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    {t('Export')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.open(route('assets.export', 'xlsx'), '_blank')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> {t('Export to Excel')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(route('assets.export', 'csv'), '_blank')}>
                    <FileType className="mr-2 h-4 w-4" /> {t('Export to CSV')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(route('assets.export', 'pdf'), '_blank')}>
                    <Printer className="mr-2 h-4 w-4" /> {t('Export to PDF')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="gap-2">
                <FileUp className="h-4 w-4" />
                {t('Import')}
              </Button>

              <Link href="/assets/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('Add Asset')}
                </Button>
              </Link>
            </div>
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
              {/* Employee combobox (searchable) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[240px] justify-between">
                    {selectedUserFilter === 'all' ? t('All Employees') : (employees.find(e => String(e.id) === String(selectedUserFilter))?.name || t('Employee'))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[280px]">
                  <Command>
                    <CommandInput placeholder={t('Search employee...')} onValueChange={(v) => setEmpQueryDebounced(v)} />
                    <CommandList>
                      <CommandEmpty>{t('No results')}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="all" onSelect={() => handleUserPick('all')}>{t('All Employees')}</CommandItem>
                        {filteredEmployees.map((e) => (
                          <CommandItem key={e.id} value={String(e.id)} onSelect={() => handleUserPick(String(e.id))}>
                            {e.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Location combobox (searchable) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[240px] justify-between">
                    {selectedLocationFilter === 'all' ? t('All Locations') : (locations.find(l => String(l.id) === String(selectedLocationFilter)) ? `${locations.find(l => String(l.id) === String(selectedLocationFilter))!.name} (${locations.find(l => String(l.id) === String(selectedLocationFilter))!.type})` : t('Location'))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[280px]">
                  <Command>
                    <CommandInput placeholder={t('Search location...')} onValueChange={(v) => setLocQueryDebounced(v)} />
                    <CommandList>
                      <CommandEmpty>{t('No results')}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="all" onSelect={() => handleLocationPick('all')}>{t('All Locations')}</CommandItem>
                        {filteredLocations.map((l) => (
                          <CommandItem key={l.id} value={String(l.id)} onSelect={() => handleLocationPick(String(l.id))}>
                            {l.name} ({l.type})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button onClick={() => debouncedSearch(search, selectedCategoryFilter, selectedUserFilter, selectedLocationFilter)} variant="secondary">
                <FileSearch className="h-4 w-4" />
              </Button>
            </div>

            {/* Assets Table */}
            <div className="rounded-md border bg-background overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">{t('No')}</TableHead>
                    <TableHead className="text-center">{t('Category')}</TableHead>
                    <TableHead className="text-center">{t('Serial Number')}</TableHead>
                    <TableHead className="text-center">{t('Brand')}</TableHead>
                    <TableHead className="text-center">{t('Model')}</TableHead>
                    <TableHead className="text-center">{t('Assigned To')}</TableHead>
                    <TableHead className="text-center">{t('Location')}</TableHead>
                    <TableHead className="text-center">{t('Status')}</TableHead>
                    <TableHead className="text-center">{t('Last Used')}</TableHead>
                    <TableHead className="text-center">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                        {t('No asset data available.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.data.map((asset, index) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium text-muted-foreground text-center">
                          {(assets.current_page - 1) * 10 + index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-center">{asset.category?.name || '-'}</TableCell>
                        <TableCell className="text-center">{asset.serial_number || '-'}</TableCell>
                        <TableCell className="text-center">{asset.brand || '-'}</TableCell>
                        <TableCell className="text-center">{asset.model || '-'}</TableCell>
                        <TableCell className="text-center">{asset.user?.name || '-'}</TableCell>
                        <TableCell className="text-center">{(asset as any).current_location ? `${(asset as any).current_location.name} (${(asset as any).current_location.type})` : '-'}</TableCell>
                        <TableCell className="text-center">{t(asset.status)}</TableCell>
                        <TableCell className="text-center">{asset.last_used_at || '-'}</TableCell>
                        <TableCell className="text-center">
                          {isAdmin && (
                            <div className="flex justify-center gap-2">
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
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {assets.links.length > 1 && (
              <div className="flex justify-center items-center pt-6 flex-wrap gap-2">
                <Button
                  disabled={assets.current_page === 1}
                  variant="outline"
                  size="sm"
                  onClick={() => router.visit(assets.links[1]?.url || '', { preserveScroll: true })}
                >
                  {t('First')}
                </Button>
                
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
                
                <Button
                  disabled={assets.current_page === assets.last_page}
                  variant="outline"
                  size="sm"
                  onClick={() => router.visit(assets.links[assets.links.length - 2]?.url || '', { preserveScroll: true })}
                >
                  {t('Last')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Dialog */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Import Assets')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Upload an Excel (.xlsx, .xls) or CSV file to import asset data.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open(route('assets.download-import-template'), '_blank')}
            >
              <FileQuestion className="h-4 w-4" /> {t('Download Import Template')}
            </Button>
            <UploadButton
              accept=".xlsx,.xls,.csv"
              label={t('Upload')}
              placeholder={t('No file chosen')}
              onFileSelected={(file) => setImportFile(file)}
            />
            {importFile && (
              <p className="text-sm text-muted-foreground">
                {t('Selected file')}: {importFile.name}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={importProcessing}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportSubmit} disabled={importProcessing || !importFile}>
              {importProcessing ? t('Importing...') : t('Import')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}