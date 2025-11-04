<?php

namespace App\Notifications;

use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketCommentAdded extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Ticket $ticket, public TicketComment $comment)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Komentar Baru pada Ticket #' . ($this->ticket->ticket_number ?? $this->ticket->id))
            ->greeting('Halo ' . ($notifiable->name ?? ''))
            ->line('Ada komentar baru pada ticket: ' . $this->ticket->title)
            ->line('Komentar oleh: ' . ($this->comment->user?->name ?? ''))
            ->line('Isi komentar: "' . $this->comment->comment . '"')
            ->action('Lihat Ticket', route('tickets.show', $this->ticket))
            ->line('Terima kasih.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number ?? null,
            'ticket_title' => $this->ticket->title,
            'comment_id' => $this->comment->id,
            'comment' => $this->comment->comment,
            'commented_by' => $this->comment->user?->name,
            'url' => route('tickets.show', $this->ticket),
        ];
    }
}
