<?php

namespace App\Notifications;

use App\Models\LoanItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoanItemReturned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public LoanItem $item)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $item = $this->item->loadMissing(['loan.borrower','asset']);
        $asset = $item->asset;
        $loan = $item->loan;

        return (new MailMessage)
            ->subject('Loan Item Returned (#'.$loan->id.')')
            ->greeting('Item Returned')
            ->line('Borrower: '.($loan->borrower?->name ?? '-'))
            ->line('Asset: '.($asset ? trim(($asset->serial_number ?: '').' '.($asset->brand ?: '').' '.($asset->model ?: '')) : ('Asset #'.$item->asset_id)))
            ->line('Returned At: '.($item->returned_at?->toDateTimeString() ?? now()->toDateTimeString()))
            ->action('View Loan', url('/loans/'.$loan->id))
            ->line('Thank you.');
    }
}
