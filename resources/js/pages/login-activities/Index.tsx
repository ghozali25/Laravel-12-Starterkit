import React, { useCallback, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { debounce } from '@/lib/utils';

interface Row {
  id: number;
  event: 'login' | 'logout' | 'failed';
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  user?: { id: number; name: string } | null;
  created_at: string;
}

interface UserLite { id: number; name: string }

interface Props {
  logs: {
    data: Row[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  users: UserLite[];
  filters: { event?: string; user_id?: string; search?: string };
}

export default function LoginActivitiesIndex({ logs, users, filters }: Props) {
  const { t } = useTranslation();
  const [eventF, setEventF] = useState(filters.event || 'all');
  const [userId, setUserId] = useState(filters.user_id || 'all');
  const [search, setSearch] = useState(filters.search || '');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Login History'), href: '/login-activities' },
  ];

  const debouncedSearch = useCallback(
    debounce((params: any) => {
      router.get('/login-activities', params, { preserveState: true, preserveScroll: true });
    }, 400),
    []
  );

  const applyFilters = (key: string, value: string) => {
    const p = {
      event: eventF === 'all' ? undefined : eventF,
      user_id: userId === 'all' ? undefined : userId,
      search: search || undefined,
      [key]: value === 'all' ? undefined : value,
    };
    debouncedSearch(p);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Login History')} />
      <div className="flex-1 p-4 md:p-6">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold">{t('Login History')}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="w-full md:w-72">
                <Input
                  placeholder={t('Search IP/User Agent/User')}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); applyFilters('search', e.target.value); }}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={eventF} onValueChange={(v) => { setEventF(v); applyFilters('event', v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Event')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Events')}</SelectItem>
                    <SelectItem value="login">{t('Login')}</SelectItem>
                    <SelectItem value="logout">{t('Logout')}</SelectItem>
                    <SelectItem value="failed">{t('Failed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-72">
                <Select value={userId} onValueChange={(v) => { setUserId(v); applyFilters('user_id', v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('User')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Users')}</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">{t('Time')}</th>
                    <th className="text-left p-2">{t('User')}</th>
                    <th className="text-left p-2">{t('Event')}</th>
                    <th className="text-left p-2">IP</th>
                    <th className="text-left p-2">{t('User Agent')}</th>
                    <th className="text-left p-2">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-muted-foreground">{t('No records')}</td>
                    </tr>
                  )}
                  {logs.data.map((r, i) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{(logs.current_page - 1) * 20 + i + 1}</td>
                      <td className="p-2">{r.created_at}</td>
                      <td className="p-2">{r.user?.name || '-'}</td>
                      <td className="p-2 capitalize">{r.event}</td>
                      <td className="p-2">{r.ip_address || '-'}</td>
                      <td className="p-2 truncate max-w-[420px]" title={r.user_agent || ''}>{r.user_agent || '-'}</td>
                      <td className="p-2">{r.session_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logs.links.length > 1 && (
              <div className="flex justify-center pt-4 gap-2 flex-wrap">
                {logs.links.map((link, i) => (
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
