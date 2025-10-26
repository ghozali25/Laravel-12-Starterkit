import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
import 'dayjs/locale/id'; // Import Indonesian locale
import 'dayjs/locale/en'; // Import English locale
import { useTranslation } from '@/lib/i18n'; // Import useTranslation
import { Input } from '@/components/ui/input'; // Import Input
import { UploadButton } from '@/components/ui/upload-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button as UIButton } from '@/components/ui/button';
import { FileSearch, Edit, Trash2 } from 'lucide-react'; // Import icons
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // Import table components
import { debounce } from '@/lib/utils'; // Import debounce

dayjs.extend(relativeTime);

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  roles: {
    id: number;
    name: string;
  }[];
}

interface Props {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    search?: string;
  };
}

export default function UserIndex({ users, filters }: Props) {
  const { t, locale } = useTranslation(); // Use the translation hook and get locale
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);
  const [search, setSearch] = useState(filters.search || '');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    dayjs.locale(locale); // Set dayjs locale dynamically
  }, [locale]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('User Management'),
      href: '/users',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/users/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        // Data will be automatically updated by Inertia.js
      },
      onError: (errors) => {
        console.error('Delete failed:', errors);
      }
    });
  };

  const handleResetPassword = (id: number) => {
    router.put(`/users/${id}/reset-password`, {}, { preserveScroll: true });
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      router.get('/users', { search: value }, { preserveState: true, preserveScroll: true });
    }, 500), // 500ms debounce delay
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleBulkSubmit = () => {
    if (!bulkFile) return;
    setBulkProcessing(true);
    const form = new FormData();
    form.append('avatar', bulkFile);
    router.post(route('users.bulk-avatar'), form, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setBulkOpen(false);
        setBulkFile(null);
        router.reload({ only: ['users'] });
      },
      onFinish: () => setBulkProcessing(false),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('User Management')} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('User Management')}</h1>
            <p className="text-muted-foreground">{t('Manage user data and their roles within the system.')}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              <UIButton variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
                {t('Bulk Replace Avatars')}
              </UIButton>
              <Link href="/users/create">
                <Button className="w-full md:w-auto" size="sm">{t('+ Add User')}</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={t('Search users...')}
            value={search}
            onChange={handleSearchChange}
          />
          <Button onClick={() => debouncedSearch(search)} variant="secondary">
            <FileSearch className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t('No')}</TableHead>
                <TableHead>{t('Name')}</TableHead>
                <TableHead>{t('Email address')}</TableHead>
                <TableHead>{t('Roles')}</TableHead>
                <TableHead>{t('Registered')}</TableHead>
                <TableHead className="text-right">{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t('No user data available.')}
                  </TableCell>
                </TableRow>
              ) : (
                users.data.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {(users.current_page - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-xs font-normal">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground italic">
                      {dayjs(user.created_at).fromNow()}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <div className="flex justify-end gap-2">
                          <Link href={`/users/${user.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" /> {t('Edit')}
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="secondary">{t('Reset')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('Reset Password?')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('Password for')} <strong>{user.name}</strong> {t('will be reset to:')}
                                  <br />
                                  <code className="bg-muted rounded px-2 py-1 text-sm">ResetPasswordNya</code>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleResetPassword(user.id)}
                                  disabled={false}
                                >
                                  {t('Yes, Reset')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-1" /> {t('Delete')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('Delete User?')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('User')} <strong>{user.name}</strong> {t('will be permanently deleted.')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user.id)}
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
        {users.links.length > 1 && (
          <div className="flex justify-center items-center pt-6 flex-wrap gap-2">
            <Button
              disabled={users.current_page === 1}
              variant="outline"
              size="sm"
              onClick={() => router.visit(users.links[1]?.url || '', { preserveScroll: true })}
            >
              {t('First')}
            </Button>
            
            {users.links.map((link, i) => (
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
              disabled={users.current_page === users.last_page}
              variant="outline"
              size="sm"
              onClick={() => router.visit(users.links[users.links.length - 2]?.url || '', { preserveScroll: true })}
            >
              {t('Last')}
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Replace Avatars Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Bulk Replace Avatars')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('Upload an image (jpg, png, webp, max 2MB) to replace all users\' profile photos.')}</p>
            <UploadButton
              accept="image/jpeg,image/png,image/webp"
              label={t('Upload')}
              placeholder={t('No file chosen')}
              onFileSelected={setBulkFile}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <UIButton variant="outline" onClick={() => setBulkOpen(false)} disabled={bulkProcessing}>
              {t('Cancel')}
            </UIButton>
            <UIButton onClick={handleBulkSubmit} disabled={bulkProcessing || !bulkFile}>
              {bulkProcessing ? t('Uploading...') : t('Save Changes')}
            </UIButton>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}