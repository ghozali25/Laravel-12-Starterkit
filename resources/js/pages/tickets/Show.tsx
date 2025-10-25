import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft, MessageSquare, User, Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);

interface User {
  id: number;
  name: string;
  email: string;
}

interface TicketComment {
  id: number;
  comment: string;
  is_internal: boolean;
  created_at: string;
  user: User;
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
  resolution?: string;
  comments: TicketComment[];
}

interface Props {
  ticket: Ticket;
}

export default function TicketShow({ ticket }: Props) {
  const { t, locale } = useTranslation();
  const [showInternalComments, setShowInternalComments] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
    comment: '',
    is_internal: false,
  });

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: t('IT Support Tickets'),
      href: '/tickets',
    },
    {
      title: ticket.ticket_number,
      href: `/tickets/${ticket.id}`,
    },
  ];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/tickets/${ticket.id}/comments`, {
      onSuccess: () => {
        setData('comment', '');
        setData('is_internal', false);
      },
    });
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

  const visibleComments = showInternalComments 
    ? ticket.comments 
    : ticket.comments.filter(comment => !comment.is_internal);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${ticket.ticket_number} - ${ticket.title}`} />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/tickets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('Back to Tickets')}
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
            <p className="text-muted-foreground">{ticket.ticket_number}</p>
          </div>
          <Link href={`/tickets/${ticket.id}/edit`}>
            <Button variant="outline" size="sm">
              {t('Edit Ticket')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Ticket Details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t('Description')}</Label>
                  <p className="mt-1 whitespace-pre-wrap">{ticket.description}</p>
                </div>
                
                {ticket.resolution && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t('Resolution')}</Label>
                    <p className="mt-1 whitespace-pre-wrap">{ticket.resolution}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('Comments')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visibleComments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">{t('No comments yet.')}</p>
                ) : (
                  visibleComments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{comment.user.name}</span>
                          {comment.is_internal && (
                            <Badge variant="secondary" className="text-xs">
                              {t('Internal')}
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {dayjs(comment.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  ))
                )}

                {ticket.comments.some(comment => comment.is_internal) && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInternalComments(!showInternalComments)}
                    >
                      {showInternalComments ? t('Hide Internal Comments') : t('Show Internal Comments')}
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comment">{t('Add Comment')}</Label>
                    <Textarea
                      id="comment"
                      value={data.comment}
                      onChange={(e) => setData('comment', e.target.value)}
                      placeholder={t('Write your comment here...')}
                      rows={3}
                      className={errors.comment ? 'border-red-500' : ''}
                    />
                    {errors.comment && (
                      <p className="text-sm text-red-500">{errors.comment}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_internal"
                        checked={data.is_internal}
                        onChange={(e) => setData('is_internal', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="is_internal" className="text-sm">
                        {t('Internal comment (only visible to IT support)')}
                      </Label>
                    </div>
                    <Button type="submit" disabled={processing || !data.comment.trim()}>
                      {processing ? t('Adding...') : t('Add Comment')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Ticket Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('Status')}</span>
                  <Badge variant={getStatusColor(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('Priority')}</span>
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('Category')}</span>
                  <span className="text-sm">{getCategoryLabel(ticket.category)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{t('Created By')}</span>
                  <span className="text-sm">{ticket.user.name}</span>
                </div>
                
                {ticket.assigned_user && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t('Assigned To')}</span>
                    <span className="text-sm">{ticket.assigned_user.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('Timeline')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">{t('Ticket Created')}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(ticket.created_at).format('MMM DD, YYYY HH:mm')}
                    </p>
                  </div>
                </div>
                
                {ticket.assigned_user && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">{t('Assigned to')} {ticket.assigned_user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(ticket.updated_at).format('MMM DD, YYYY HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
                
                {ticket.resolved_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">{t('Resolved')}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(ticket.resolved_at).format('MMM DD, YYYY HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
