<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Date;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'title',
        'description',
        'priority',
        'status',
        'category',
        'user_id',
        'assigned_to',
        'resolved_at',
        'resolution',
        'damage_photo_path',
        'damage_photos',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'damage_photos' => 'array',
    ];

    /**
     * Get the user who created the ticket.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user assigned to handle the ticket.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the ticket comments.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }

    /**
     * Status histories.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(TicketStatusHistory::class);
    }

    /**
     * Generate unique ticket number.
     */
    public static function generateTicketNumber(): string
    {
        do {
            $number = 'TKT-' . strtoupper(uniqid());
        } while (self::where('ticket_number', $number)->exists());

        return $number;
    }

    /**
     * Boot method to auto-generate ticket number.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = self::generateTicketNumber();
            }
        });

        // Create history on created
        static::created(function (Ticket $ticket) {
            $ticket->histories()->create([
                'status' => $ticket->status,
                'changed_at' => $ticket->created_at ?? now(),
            ]);
        });

        // Append history when status changes
        static::updating(function (Ticket $ticket) {
            if ($ticket->isDirty('status')) {
                $ticket->histories()->create([
                    'status' => $ticket->status,
                    'changed_at' => now(),
                ]);
            }
        });
    }
}
