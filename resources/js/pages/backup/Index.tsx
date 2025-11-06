import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { type BreadcrumbItem } from '@/types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/lib/i18n'; // Import useTranslation

interface Backup {
  name: string;
  size: number;
  last_modified: number;
  download_url: string;
  relative?: string;
}

interface TrashPayload {
  users: Array<{ id: number; name: string; email: string; deleted_at: string }>
  tickets: Array<{ id: number; ticket_number: string; title: string; deleted_at: string }>
  ticket_comments: Array<{ id: number; ticket_id: number; user_id: number; deleted_at: string }>
  assets: Array<{ id: number; serial_number: string | null; brand: string | null; model: string | null; deleted_at: string }>
  vendors: Array<{ id: number; name: string; deleted_at: string }>
}

interface Props {
  backups: Backup[];
  trash?: TrashPayload;
}

function formatSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export default function BackupIndex({ backups }: Props) {
  const { t } = useTranslation(); // Use the translation hook
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Backup'), href: '/backup' },
  ];

  const handleBackup = () => {
    router.post('/backup/run', {}, {
      onSuccess: () => toast.success('Backup created successfully'),
      onError: () => toast.error('Failed to create backup'),
      preserveScroll: true,
    });
  };

  const handleDelete = (file: string) => {
    router.delete(`/backup/delete/${file}`, {
      onSuccess: () => toast.success('Backup deleted successfully'),
      onError: () => toast.error('Failed to delete backup'),
      preserveScroll: true,
    });
  };

  const handleRestore = (file: string) => {
    router.post('/backup/restore', { file }, {
      onSuccess: () => toast.success('Restore started / completed successfully'),
      onError: () => toast.error('Failed to restore backup'),
      preserveScroll: true,
    });
  };

  const handleTrashRestore = (model: keyof TrashPayload, id: number) => {
    router.post('/backup/trash/restore', { model, id }, {
      onSuccess: () => toast.success(t('Restored successfully')),
      onError: () => toast.error(t('Failed to restore item')),
      preserveScroll: true,
    });
  };

  const handleTrashForceDelete = (model: keyof TrashPayload, id: number) => {
    router.post('/backup/trash/force-delete', { model, id }, {
      onSuccess: () => toast.success(t('Permanently deleted')),
      onError: () => toast.error(t('Failed to delete item')),
      preserveScroll: true,
    });
  };

  return (
    <AppLayout title={t('Backup')} breadcrumbs={breadcrumbs}>
      <Head title={t('Backup')} />

      <div className="p-4 md:p-6 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{t('Database Backups')}</CardTitle>
              <p className="text-muted-foreground text-sm">{t('Manage system backup files')}</p>
            </div>
            <Button onClick={handleBackup}>{t('Create Backup')}</Button>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 space-y-4">
            {backups.length === 0 ? (
              <p className="text-muted-foreground text-center">{t('No backups available.')}</p>
            ) : (
              <ul className="space-y-2">
                {backups.map((backup, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border rounded p-3 bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSize(backup.size)} •{' '}
                        {new Date(backup.last_modified * 1000).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={backup.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">{t('Download')}</Button>
                      </a>

                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">{t('Restore')}</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('Restore this backup?')}</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => handleRestore(backup.relative || backup.name)}
                              >
                                {t('Yes, Restore')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">{t('Delete')}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('Delete this backup?')}</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(backup.relative || backup.name)}
                            >
                              {t('Yes, Delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Trash Section */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-2xl font-bold">{t('Trash')}</CardTitle>
              <p className="text-muted-foreground text-sm">{t('Soft-deleted records. You can restore or permanently delete them here.')}</p>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-6">
            {(!page.props as any) && null}
            {(() => {
              const trash = (page.props as any)?.trash as TrashPayload | undefined;
              if (!trash) {
                return <p className="text-muted-foreground">{t('No trash data available.')}</p>;
              }

              const Section = ({
                title,
                items,
                renderLabel,
                model,
              }: {
                title: string;
                items: Array<any>;
                renderLabel: (item: any) => React.ReactNode;
                model: keyof TrashPayload;
              }) => (
                <div className="space-y-2">
                  <div className="font-semibold">{title} ({items.length})</div>
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('Empty')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((it) => (
                        <li key={`${model}-${it.id}`} className="flex items-center justify-between border rounded p-3">
                          <div className="min-w-0">
                            <div className="truncate">{renderLabel(it)}</div>
                            <div className="text-xs text-muted-foreground">{t('Deleted at')}: {new Date(it.deleted_at).toLocaleString()}</div>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleTrashRestore(model, it.id)}>{t('Restore')}</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">{t('Delete Permanently')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('Permanently delete this item?')}</AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleTrashForceDelete(model, it.id)}>
                                      {t('Yes, Delete')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );

              return (
                <div className="space-y-6">
                  <Section
                    title={t('Users')}
                    items={trash.users}
                    model="users"
                    renderLabel={(u) => (<span>{u.name} <span className="text-muted-foreground">({u.email})</span></span>)}
                  />
                  <Section
                    title={t('Tickets')}
                    items={trash.tickets}
                    model="tickets"
                    renderLabel={(tkt) => (<span>{tkt.ticket_number} — {tkt.title}</span>)}
                  />
                  <Section
                    title={t('Ticket Comments')}
                    items={trash.ticket_comments}
                    model="ticket_comments"
                    renderLabel={(c) => (<span>{t('Comment')} #{c.id} • {t('Ticket')} #{c.ticket_id}</span>)}
                  />
                  <Section
                    title={t('Assets')}
                    items={trash.assets}
                    model="assets"
                    renderLabel={(a) => (<span>{a.serial_number || '-'} <span className="text-muted-foreground">{[a.brand, a.model].filter(Boolean).join(' ')}</span></span>)}
                  />
                  <Section
                    title={t('Vendors')}
                    items={trash.vendors}
                    model="vendors"
                    renderLabel={(v) => (<span>{v.name}</span>)}
                  />
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}