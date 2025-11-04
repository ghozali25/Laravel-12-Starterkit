<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrower_user_id',
        'loaned_by_user_id',
        'due_at',
        'returned_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function borrower(): BelongsTo { return $this->belongsTo(User::class, 'borrower_user_id'); }
    public function loanedBy(): BelongsTo { return $this->belongsTo(User::class, 'loaned_by_user_id'); }
    public function items(): HasMany { return $this->hasMany(LoanItem::class); }
}
