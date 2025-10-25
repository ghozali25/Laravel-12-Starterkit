import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem } from '@/types';

export default function Reports() {
  const { t } = useTranslation();

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('Reports'), href: '/reports' },
  ];

  const ExportButtons = ({ type }: { type: 'employees' | 'assets' | 'tickets' }) => (
    <div className="flex gap-2 flex-wrap">
      <a
        href={route('reports.export', { type, format: 'xlsx' })}
        download
        aria-label={`${t('Export to Excel')} - ${type}`}
      >
        <Button size="sm" className="gap-2"><Download className="h-4 w-4" /> {t('Export to Excel')}</Button>
      </a>
      <a
        href={route('reports.export', { type, format: 'csv' })}
        download
        aria-label={`${t('Export to CSV')} - ${type}`}
      >
        <Button size="sm" variant="outline" className="gap-2"><Download className="h-4 w-4" /> {t('Export to CSV')}</Button>
      </a>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Reports')} />
      <div className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{t('Reports')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('Export')} {t('All data')}.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('Employees Report')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportButtons type="employees" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('Assets Report')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportButtons type="assets" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('Tickets Report')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExportButtons type="tickets" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
