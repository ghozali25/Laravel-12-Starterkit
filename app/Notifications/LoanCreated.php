<?php

namespace App\Notifications;

use App\Models\Loan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoanCreated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Loan $loan)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $loan = $this->loan->loadMissing(['borrower','loanedBy','items.asset']);
        $items = $loan->items->map(function ($it) {
            $a = $it->asset;
            return $a ? trim(($a->serial_number ?: '').' '.($a->brand ?: '').' '.($a->model ?: '')) : ('Asset #'.$it->asset_id);
        })->implode(', ');

        return (new MailMessage)
            ->subject('New Loan #'.$loan->id)
            ->greeting('Loan Created')
            ->line('Borrower: '.($loan->borrower?->name ?? '-'))
            ->line('Due: '.($loan->due_at?->toDateTimeString() ?? '-'))
            ->line('Items: '.$items)
            ->action('View Loan', url('/loans/'.$loan->id))
            ->line('Thank you.');
    }
}
