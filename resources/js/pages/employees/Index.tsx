import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem, type Division } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import 'dayjs/locale/en';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { UploadButton } from '@/components/ui/upload-button';
import { Plus, Edit, Trash2, FileDown, FileUp, FileSearch, FileSpreadsheet, FileType, Printer, FileQuestion, KeyRound, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { debounce } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components
import { useInitials } from '@/hooks/use-initials'; // Import useInitials hook
import ImagePreviewDialog from '@/components/ImagePreviewDialog'; // Import new dialog component

dayjs.extend(relativeTime);

interface Employee {
  id: number;
  name: string;
  email: string;
  nik: string | null;
  personal_email: string | null;
  phone_number: string | null;
  address: string | null;
  created_at: string;
  roles: {
    id: number;
    name: string;
  }[];
  manager?: {
    id: number;
    name: string;
  } | null;
  division?: Division | null;
  avatar_url?: string | null; // Add avatar_url
}

interface PotentialManager {
  id: number;
  name: string;
}

interface Props {
  employees: {
    data: Employee[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search?: string;
    manager_id?: string;
    division_id?: string;
  };
  potentialManagers: PotentialManager[];
  divisions: Division[];
}

export default function EmployeeIndex({ employees, filters, potentialManagers, divisions }: Props) {
  const { t, locale } = useTranslation();
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);

  const [search, setSearch] = useState(filters.search || '');
  const [selectedManagerFilter, setSelectedManagerFilter] = useState(filters.manager_id || 'all');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState(filters.division_id || 'all');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProcessing, setImportProcessing] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageAlt, setPreviewImageAlt] = useState('');
  const getInitials = useInitials(); // Initialize useInitials

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
      title: t('Employee Management'),
      href: '/employees',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/employees/${id}`, {
      preserveScroll: true,
      onSuccess: () => notify('success', t('Employee deleted successfully.')),
      onError: () => notify('error', t('Failed to delete employee.')),
    });
  };

  const debouncedSearch = useCallback(
    debounce((searchValue: string, managerId: string, divisionId: string) => {
      router.get('/employees', {
        search: searchValue,
        manager_id: managerId === 'all' ? '' : managerId,
        division_id: divisionId === 'all' ? '' : divisionId,
      }, { preserveState: true, preserveScroll: true });
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value, selectedManagerFilter, selectedDivisionFilter);
  };

  const handleManagerFilterChange = (value: string) => {
    setSelectedManagerFilter(value);
    debouncedSearch(search, value, selectedDivisionFilter);
  };

  const handleDivisionFilterChange = (value: string) => {
    setSelectedDivisionFilter(value);
    debouncedSearch(search, selectedManagerFilter, value);
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

    router.post('/employees/import', formData, {
      forceFormData: true,
      onSuccess: () => {
        notify('success', t('Employees imported successfully.'));
        setIsImportDialogOpen(false);
        setImportFile(null);
        router.reload({ only: ['employees'] });
      },
      onError: (errors) => {
        notify('error', t('Failed to import employees.'));
        console.error(errors);
      },
      onFinish: () => setImportProcessing(false),
    });
  };

  const openImagePreview = (src: string | null, alt: string) => {
    setPreviewImageUrl(src);
    setPreviewImageAlt(alt);
    setIsImagePreviewOpen(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Employee Management')} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('Employee Management')}</h1>
            <p className="text-muted-foreground">{t('Manage employee data and their roles within the system.')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <FileDown className="h-4 w-4" />
                      {t('Export')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(route('employees.export', 'xlsx'), '_blank')}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> {t('Export to Excel')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(route('employees.export', 'csv'), '_blank')}>
                      <FileType className="mr-2 h-4 w-4" /> {t('Export to CSV')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(route('employees.export', 'pdf'), '_blank')}>
                      <Printer className="mr-2 h-4 w-4" /> {t('Export to PDF')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="gap-2">
                  <FileUp className="h-4 w-4" />
                  {t('Import')}
                </Button>

                <Link href="/employees/create">
                  <Button className="w-full md:w-auto" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('Add Employee')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <Input
            type="text"
            placeholder={t('Search employees...')}
            value={search}
            onChange={handleSearchChange}
          />
          <Select
            value={selectedManagerFilter}
            onValueChange={handleManagerFilterChange}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder={t('Filter by Manager')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All Managers')}</SelectItem>
              {potentialManagers.map((manager) => (
                <SelectItem key={manager.id} value={String(manager.id)}>
                  {manager.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedDivisionFilter}
            onValueChange={handleDivisionFilterChange}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder={t('Filter by Division')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All Divisions')}</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division.id} value={String(division.id)}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => debouncedSearch(search, selectedManagerFilter, selectedDivisionFilter)} variant="secondary">
            <FileSearch className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t('No')}</TableHead>
                <TableHead>{t('Photo')}</TableHead> {/* New TableHead for Photo */}
                <TableHead>{t('NIK')}</TableHead>
                <TableHead>{t('Name')}</TableHead>
                <TableHead>{t('Company Email')}</TableHead>
                <TableHead>{t('Personal Email')}</TableHead>
                <TableHead>{t('Phone Number')}</TableHead>
                <TableHead>{t('Address')}</TableHead>
                <TableHead>{t('Reports To')}</TableHead>
                <TableHead>{t('Division')}</TableHead>
                <TableHead>{t('Roles')}</TableHead>
                <TableHead className="text-right">{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                    {t('No employee data available.')}
                  </TableCell>
                </TableRow>
              ) : (
                employees.data.map((employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {(employees.current_page - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8 cursor-pointer" onClick={() => openImagePreview(employee.avatar_url ?? null, employee.name)}>
                        <AvatarImage src={employee.avatar_url || undefined} alt={employee.name} />
                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{employee.nik || '-'}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.personal_email || '-'}</TableCell>
                    <TableCell>{employee.phone_number || '-'}</TableCell>
                    <TableCell>{employee.address || '-'}</TableCell>
                    <TableCell>{employee.manager?.name || '-'}</TableCell>
                    <TableCell>{employee.division?.name || '-'}</TableCell>
                    <TableCell>
                      {employee.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {employee.roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-xs font-normal">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2">
                          <Link href={`/employees/${employee.id}/edit`}>
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
                                <AlertDialogTitle>{t('Delete Employee?')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('Employee')} <strong>{employee.name}</strong> {t('will be permanently deleted.')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(employee.id)}
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
        {employees.links.length > 1 && (
          <div className="flex justify-center items-center pt-6 flex-wrap gap-2">
            {/* First Page Button */}
            <Button
              disabled={employees.current_page === 1}
              variant="outline"
              size="sm"
              onClick={() => router.visit(employees.links[1]?.url || '', { preserveScroll: true })}
            >
              {t('First')}
            </Button>
            
            {employees.links.map((link, i) => (
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
            
            {/* Last Page Button */}
            <Button
              disabled={employees.current_page === employees.last_page}
              variant="outline"
              size="sm"
              onClick={() => router.visit(employees.links[employees.links.length - 2]?.url || '', { preserveScroll: true })}
            >
              {t('Last')}
            </Button>
          </div>
        )}
      </div>

      {/* Import Dialog */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Import Employees')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Upload an Excel (.xlsx, .xls) or CSV file to import employee data.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open(route('employees.download-import-template'), '_blank')}
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

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        src={previewImageUrl}
        alt={previewImageAlt}
        open={isImagePreviewOpen}
        onOpenChange={setIsImagePreviewOpen}
      />
    </AppLayout>
  );
}