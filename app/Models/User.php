<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\HasMedia;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, InteractsWithMedia, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nik', // Tambahkan ini
        'personal_email', // Tambahkan ini
        'phone_number', // Tambahkan ini
        'address', // Tambahkan ini
        'manager_id', // Tambahkan ini
        'division_id', // Tambahkan ini
        'location_id', // Tambahkan ini
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Append computed attributes when serializing to arrays/JSON.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function mediaFolders()
    {
        return $this->hasMany(MediaFolder::class);
    }

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatars')->singleFile();
    }

    /**
     * Accessor for avatar_url.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('avatars') ?: null;
    }

    /**
     * Get the manager of the user.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the users that report to this user.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Get the division that the user belongs to.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * Get the location (site/branch/company) the user belongs to.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the tickets created by the user.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Get the tickets assigned to the user.
     */
    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    /**
     * Get the ticket comments made by the user.
     */
    public function ticketComments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }
}