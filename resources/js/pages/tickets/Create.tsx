import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft } from 'lucide-react';

export default function TicketCreate() {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'other' as 'hardware' | 'software' | 'network' | 'email' | 'access' | 'other',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('IT Support Tickets'),
      href: '/tickets',
    },
    {
      title: t('Create Ticket'),
      href: '/tickets/create',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/tickets');
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: t('Low'),
      medium: t('Medium'),
      high: t('High'),
      urgent: t('Urgent'),
    };
    return labels[priority] || priority;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      hardware: t('Hardware'),
      software: t('Software'),
      network: t('Network'),
      email: t('Email'),
      access: t('Access'),
      other: t('Other'),
    };
    return labels[category] || category;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('Create Ticket')} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/tickets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('Back to Tickets')}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('Create New Ticket')}</h1>
            <p className="text-muted-foreground">{t('Submit a new IT support request.')}</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{t('Ticket Information')}</CardTitle>
            <CardDescription>
              {t('Please provide detailed information about your IT support request.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('Title')} *</Label>
                <Input
                  id="title"
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder={t('Brief description of the issue')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('Description')} *</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder={t('Detailed description of the issue, including steps to reproduce if applicable')}
                  rows={6}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">{t('Priority')} *</Label>
                  <Select
                    value={data.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setData('priority', value)}
                  >
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('Select priority')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('Low')}</SelectItem>
                      <SelectItem value="medium">{t('Medium')}</SelectItem>
                      <SelectItem value="high">{t('High')}</SelectItem>
                      <SelectItem value="urgent">{t('Urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-red-500">{errors.priority}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t('Category')} *</Label>
                  <Select
                    value={data.category}
                    onValueChange={(value: 'hardware' | 'software' | 'network' | 'email' | 'access' | 'other') => setData('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('Select category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">{t('Hardware')}</SelectItem>
                      <SelectItem value="software">{t('Software')}</SelectItem>
                      <SelectItem value="network">{t('Network')}</SelectItem>
                      <SelectItem value="email">{t('Email')}</SelectItem>
                      <SelectItem value="access">{t('Access')}</SelectItem>
                      <SelectItem value="other">{t('Other')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/tickets">
                  <Button type="button" variant="outline">
                    {t('Cancel')}
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? t('Creating...') : t('Create Ticket')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
