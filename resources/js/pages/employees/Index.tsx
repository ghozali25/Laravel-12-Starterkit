import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
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
import { Plus, Edit, Trash2, FileDown, FileUp, FileSearch, FileSpreadsheet, FileType, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function EmployeeIndex({ employees, filters }: Props) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProcessing, setImportProcessing] = useState(false);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('Employee Management'),
      href: '/employees',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/employees/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success(t('Employee deleted successfully.')),
      onError: () => toast.error(t('Failed to delete employee.')),
    });
  };

  const handleSearch = () => {
    router.get('/employees', { search }, { preserveState: true, preserveScroll: true });
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
      toast.error(t('Please select a file to import.'));
      return;
    }

    setImportProcessing(true);
    const formData = new FormData();
    formData.append('file', importFile);

    router.post('/employees/import', formData, {
      forceFormData: true,
      onSuccess: () => {
        toast.success(t('Employees imported successfully.'));
        setIsImportDialogOpen(false);
        setImportFile(null);
        router.reload({ only: ['employees'] });
      },
      onError: (errors) => {
        toast.error(t('Failed to import employees.'));
        console.error(errors);
      },
      onFinish: () => setImportProcessing(false),
    });
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
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={t('Search employees...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} variant="secondary">
            <FileSearch className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 divide-y rounded-md border bg-background">
          {employees.data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{t('No employee data available.')}</div>
          ) : (
            employees.data.map((employee) => (
              <div
                key={employee.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-5 hover:bg-muted/50 transition"
              >
                {/* Avatar dan Informasi */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-primary">
                    {getInitials(employee.name)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.email} {employee.personal_email && `(${employee.personal_email})`}
                    </div>
                    {employee.nik && <div className="text-xs text-muted-foreground">NIK: {employee.nik}</div>}
                    {employee.phone_number && <div className="text-xs text-muted-foreground">{t('Phone')}: {employee.phone_number}</div>}
                    {employee.address && <div className="text-xs text-muted-foreground">{t('Address')}: {employee.address}</div>}
                    <div className="text-xs text-muted-foreground italic">
                      {t('Registered')} {dayjs(employee.created_at).fromNow()}
                    </div>
                    {employee.roles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {employee.roles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="text-xs font-normal">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Aksi */}
                <div className="flex flex-wrap gap-2 md:justify-end">
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
                          disabled={false} // processing state can be added here if needed
                        >
                          {t('Yes, Delete')}
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
        {employees.links.length > 1 && (
          <div className="flex justify-center pt-6 flex-wrap gap-2">
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
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFileChange} />
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