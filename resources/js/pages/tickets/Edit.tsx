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

interface User {
  id: number;
  name: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  category: 'hardware' | 'software' | 'network' | 'email' | 'access' | 'other';
  assigned_to?: number;
  resolution?: string;
}

interface Props {
  ticket: Ticket;
  users: User[];
}

export default function TicketEdit({ ticket, users }: Props) {
  const { t } = useTranslation();
  const { data, setData, put, processing, errors } = useForm({
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    category: ticket.category,
    status: ticket.status,
    assigned_to: ticket.assigned_to ? ticket.assigned_to.toString() : 'unassigned',
    resolution: ticket.resolution || '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('IT Support Tickets'),
      href: '/tickets',
    },
    {
      title: ticket.ticket_number,
      href: `/tickets/${ticket.id}`,
    },
    {
      title: t('Edit'),
      href: `/tickets/${ticket.id}/edit`,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const SwalRef: any = (window as any).Swal;
    if (SwalRef) {
      const result = await SwalRef.fire({
        title: t('Save changes?'),
        text: t('This will update the ticket information.'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: t('Yes, save it'),
        cancelButtonText: t('Cancel'),
      });
      if (!result.isConfirmed) return;
    }
    put(`/tickets/${ticket.id}`);
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: t('Open'),
      in_progress: t('In Progress'),
      resolved: t('Resolved'),
      closed: t('Closed'),
      cancelled: t('Cancelled'),
    };
    return labels[status] || status;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${t('Edit')} ${ticket.ticket_number}`} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/tickets/${ticket.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('Back to Ticket')}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('Edit Ticket')}</h1>
            <p className="text-muted-foreground">{ticket.ticket_number}</p>
          </div>
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>{t('Ticket Information')}</CardTitle>
            <CardDescription>
              {t('Update ticket details and assignment.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('Title')} *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('Description')} *</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="status">{t('Status')} *</Label>
                  <Select
                    value={data.status}
                    onValueChange={(value: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled') => setData('status', value)}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('Select status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">{t('Open')}</SelectItem>
                      <SelectItem value="in_progress">{t('In Progress')}</SelectItem>
                      <SelectItem value="resolved">{t('Resolved')}</SelectItem>
                      <SelectItem value="closed">{t('Closed')}</SelectItem>
                      <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_to">{t('Assigned To')}</Label>
                  <Select
                    value={data.assigned_to || 'unassigned'}
                    onValueChange={(value) => setData('assigned_to', value)}
                  >
                    <SelectTrigger className={errors.assigned_to ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('Select assignee')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">{t('Unassigned')}</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assigned_to && (
                    <p className="text-sm text-red-500">{errors.assigned_to}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">{t('Resolution')}</Label>
                <Textarea
                  id="resolution"
                  value={data.resolution}
                  onChange={(e) => setData('resolution', e.target.value)}
                  placeholder={t('Resolution details (optional)')}
                  rows={3}
                  className={errors.resolution ? 'border-red-500' : ''}
                />
                {errors.resolution && (
                  <p className="text-sm text-red-500">{errors.resolution}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/tickets/${ticket.id}`}>
                  <Button type="button" variant="outline">
                    {t('Cancel')}
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? t('Updating...') : t('Update Ticket')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
