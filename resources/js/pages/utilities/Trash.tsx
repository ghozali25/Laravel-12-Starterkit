import React, { useMemo, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface TrashPayload {
  users: Array<{ id: number; name: string; email: string; deleted_at: string }>
  tickets: Array<{ id: number; ticket_number: string; title: string; deleted_at: string }>
  ticket_comments: Array<{ id: number; ticket_id: number; user_id: number; deleted_at: string }>
  assets: Array<{ id: number; serial_number: string | null; brand: string | null; model: string | null; deleted_at: string }>
  vendors: Array<{ id: number; name: string; deleted_at: string }>
}

type ModelKey = keyof TrashPayload;

type SelectionState = Record<ModelKey, Record<number, boolean>>;

type Props = {
  trash: TrashPayload;
  limit: number;
}

export default function UtilitiesTrash({ trash }: Props) {
  const { t } = useTranslation();
  const page = usePage();
  const isAdmin = Boolean((page.props as any)?.auth?.is_admin);

  const [active, setActive] = useState<ModelKey>('users');

  const [selected, setSelected] = useState<SelectionState>({
    users: {}, tickets: {}, ticket_comments: {}, assets: {}, vendors: {},
  });

  const models: Array<{ key: ModelKey; title: string }> = [
    { key: 'users', title: t('Users') },
    { key: 'tickets', title: t('Tickets') },
    { key: 'ticket_comments', title: t('Ticket Comments') },
    { key: 'assets', title: t('Assets') },
    { key: 'vendors', title: t('Vendors') },
  ];

  const counts = useMemo(() => ({
    users: trash.users.length,
    tickets: trash.tickets.length,
    ticket_comments: trash.ticket_comments.length,
    assets: trash.assets.length,
    vendors: trash.vendors.length,
  }), [trash]);

  const setAllInModel = (model: ModelKey, checked: boolean) => {
    const items = trash[model];
    setSelected((prev) => ({
      ...prev,
      [model]: items.reduce((acc, it) => ({ ...acc, [it.id]: checked }), {} as Record<number, boolean>)
    }));
  };

  const toggleOne = (model: ModelKey, id: number, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [model]: { ...prev[model], [id]: checked } }));
  };

  const getSelectedIds = (model: ModelKey) => Object.keys(selected[model]).filter((id) => selected[model][Number(id)]).map(Number);

  const bulkRestore = (model: ModelKey) => {
    const ids = getSelectedIds(model);
    if (ids.length === 0) return toast.info(t('No items selected'));
    router.post('/utilities/trash/bulk-restore', { model, ids }, {
      onSuccess: () => {
        toast.success(t('Restored successfully'));
        // Optimistic: clear selection on success
        setSelected((prev) => ({ ...prev, [model]: {} }));
      },
      onError: () => toast.error(t('Failed to restore items')),
      preserveScroll: true,
    });
  };

  const bulkForceDelete = (model: ModelKey) => {
    const ids = getSelectedIds(model);
    if (ids.length === 0) return toast.info(t('No items selected'));
    router.post('/utilities/trash/bulk-force-delete', { model, ids }, {
      onSuccess: () => {
        toast.success(t('Permanently deleted'));
        setSelected((prev) => ({ ...prev, [model]: {} }));
      },
      onError: () => toast.error(t('Failed to delete items')),
      preserveScroll: true,
    });
  };

  const renderTable = (model: ModelKey) => {
    const items = trash[model] as any[];
    const allChecked = items.length > 0 && items.every((it) => selected[model][it.id]);
    const someChecked = items.some((it) => selected[model][it.id]);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox checked={allChecked} onCheckedChange={(v) => setAllInModel(model, Boolean(v))} />
            <span className="text-sm text-muted-foreground">{t('Select all')}</span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={!someChecked} onClick={() => bulkRestore(model)}>{t('Restore Selected')}</Button>
              <Button size="sm" variant="destructive" disabled={!someChecked} onClick={() => bulkForceDelete(model)}>{t('Delete Selected')}</Button>
            </div>
          )}
        </div>
        <div className="border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-16">{t('No')}</TableHead>
                <TableHead>{t('Info')}</TableHead>
                <TableHead className="w-56">{t('Deleted at')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">{t('Empty')}</TableCell>
                </TableRow>
              ) : items.map((it, idx) => (
                <TableRow key={`${model}-${it.id}`}>
                  <TableCell>
                    <Checkbox checked={Boolean(selected[model][it.id])} onCheckedChange={(v) => toggleOne(model, it.id, Boolean(v))} />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell>
                    {model === 'users' && (<span>{it.name} <span className="text-muted-foreground">({it.email})</span></span>)}
                    {model === 'tickets' && (<span>{it.ticket_number} — {it.title}</span>)}
                    {model === 'ticket_comments' && (<span>{t('Comment')} #{it.id} • {t('Ticket')} #{it.ticket_id}</span>)}
                    {model === 'assets' && (<span>{it.serial_number || '-'} <span className="text-muted-foreground">{[it.brand, it.model].filter(Boolean).join(' ')}</span></span>)}
                    {model === 'vendors' && (<span>{it.name}</span>)}
                  </TableCell>
                  <TableCell>{new Date(it.deleted_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <AppLayout title={t('Utilities - Trash')}>
      <Head title={t('Utilities - Trash')} />
      <div className="p-4 md:p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('Trash')}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <Tabs value={active} onValueChange={(v: string) => setActive(v as ModelKey)}>
              <TabsList className="flex flex-wrap gap-2">
                {models.map(({ key, title }) => (
                  <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {title} ({counts[key]})
                  </TabsTrigger>
                ))}
              </TabsList>

              {models.map(({ key }) => (
                <TabsContent key={key} value={key} className="mt-4 space-y-3">
                  {renderTable(key)}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
