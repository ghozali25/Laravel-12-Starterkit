<?php

namespace App\Exports;

use App\Models\Ticket;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TicketsExport implements FromCollection, WithHeadings, WithMapping
{
    protected Collection $tickets;

    public function __construct(Collection $tickets)
    {
        $this->tickets = $tickets;
    }

    public function collection()
    {
        return $this->tickets;
    }

    public function headings(): array
    {
        return [
            'Ticket Number',
            'Title',
            'Status',
            'Priority',
            'Category',
            'Created By',
            'Assigned To',
            'Created At',
            'Resolved At',
        ];
    }

    public function map($ticket): array
    {
        return [
            $ticket->ticket_number,
            $ticket->title,
            $ticket->status,
            $ticket->priority,
            $ticket->category,
            optional($ticket->user)->name,
            optional($ticket->assignedUser)->name,
            optional($ticket->created_at)?->format('Y-m-d H:i:s'),
            optional($ticket->resolved_at)?->format('Y-m-d H:i:s'),
        ];
    }
}
