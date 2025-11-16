import React, { useState, useEffect, useCallback } from 'react';
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
import { FileSearch, Edit, Trash2, Plus, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { debounce } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

dayjs.extend(relativeTime);

interface User {
  id: number;
  name: string;
  email: string;
}

interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  category: 'hardware' | 'software' | 'network' | 'email' | 'access' | 'other';
  user: User;
  assigned_user?: User;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

interface Props {
  tickets: {
    data: Ticket[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
  };
}

export default function TicketIndex({ tickets, filters }: Props) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');
  const [category, setCategory] = useState(filters.category || 'all');

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('IT Support Tickets'),
      href: '/tickets',
    },
  ];

  const handleDelete = (id: number) => {
    router.delete(`/tickets/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        // Data will be automatically updated by Inertia.js
      },
      onError: (errors) => {
        console.error('Delete failed:', errors);
      }
    });
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((params: any) => {
      router.get('/tickets', params, { preserveState: true, preserveScroll: true });
    }, 500),
    []
  );

  const handleFilterChange = (key: string, value: string) => {
    const params = {
      search,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      category: category === 'all' ? undefined : category,
      [key]: value === 'all' ? undefined : value,
    };
    debouncedSearch(params);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    handleFilterChange('search', value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      case 'closed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
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

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: t('Low'),
      medium: t('Medium'),
      high: t('High'),
      urgent: t('Urgent'),
    };
    return labels[priority] || priority;
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
      <Head title={t('IT Support Tickets')} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('IT Support Tickets')}</h1>
            <p className="text-muted-foreground">{t('Manage and track IT support requests.')}</p>
          </div>
          <Link href="/tickets/create">
            <Button className="w-full md:w-auto" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('Create Ticket')}
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={t('Search tickets...')}
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={status} onValueChange={(value) => {
            setStatus(value);
            handleFilterChange('status', value);
          }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t('All Status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All Status')}</SelectItem>
              <SelectItem value="open">{t('Open')}</SelectItem>
              <SelectItem value="in_progress">{t('In Progress')}</SelectItem>
              <SelectItem value="resolved">{t('Resolved')}</SelectItem>
              <SelectItem value="closed">{t('Closed')}</SelectItem>
              <SelectItem value="cancelled">{t('Cancelled')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(value) => {
            setPriority(value);
            handleFilterChange('priority', value);
          }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t('All Priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All Priority')}</SelectItem>
              <SelectItem value="low">{t('Low')}</SelectItem>
              <SelectItem value="medium">{t('Medium')}</SelectItem>
              <SelectItem value="high">{t('High')}</SelectItem>
              <SelectItem value="urgent">{t('Urgent')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(value) => {
            setCategory(value);
            handleFilterChange('category', value);
          }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t('All Categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All Categories')}</SelectItem>
              <SelectItem value="hardware">{t('Hardware')}</SelectItem>
              <SelectItem value="software">{t('Software')}</SelectItem>
              <SelectItem value="network">{t('Network')}</SelectItem>
              <SelectItem value="email">{t('Email')}</SelectItem>
              <SelectItem value="access">{t('Access')}</SelectItem>
              <SelectItem value="other">{t('Other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">{t('No')}</TableHead>
                <TableHead className="text-center">{t('Ticket #')}</TableHead>
                <TableHead className="text-center">{t('Title')}</TableHead>
                <TableHead className="text-center">{t('Priority')}</TableHead>
                <TableHead className="text-center">{t('Status')}</TableHead>
                <TableHead className="text-center">{t('Category')}</TableHead>
                <TableHead className="text-center">{t('Created By')}</TableHead>
                <TableHead className="text-center">{t('Assigned To')}</TableHead>
                <TableHead className="text-center">{t('Created')}</TableHead>
                <TableHead className="text-center">{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    {t('No tickets found.')}
                  </TableCell>
                </TableRow>
              ) : (
                tickets.data.map((ticket, index) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium text-muted-foreground text-center">
                      {(tickets.current_page - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-center">{ticket.ticket_number}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-center">{ticket.title}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{getCategoryLabel(ticket.category)}</TableCell>
                    <TableCell className="text-center">{ticket.user?.name || '-'}</TableCell>
                    <TableCell className="text-center">{ticket.assigned_user?.name || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground italic text-center">
                      {dayjs(ticket.created_at).fromNow()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/tickets/${ticket.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            {t('View')}
                          </Button>
                        </Link>
                        <Link href={`/tickets/${ticket.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            {t('Edit')}
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t('Delete')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('Delete Ticket?')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('Ticket')} <strong>{ticket.ticket_number}</strong> {t('will be permanently deleted.')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(ticket.id)}
                                disabled={false}
                              >
                                {t('Yes, Delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {tickets.links.length > 1 && (
          <div className="flex justify-center items-center pt-6 flex-wrap gap-2">
            <Button
              disabled={tickets.current_page === 1}
              variant="outline"
              size="sm"
              onClick={() => router.visit(tickets.links[1]?.url || '', { preserveScroll: true })}
            >
              {t('First')}
            </Button>
            
            {tickets.links.map((link, i) => (
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
              disabled={tickets.current_page === tickets.last_page}
              variant="outline"
              size="sm"
              onClick={() => router.visit(tickets.links[tickets.links.length - 2]?.url || '', { preserveScroll: true })}
            >
              {t('Last')}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
