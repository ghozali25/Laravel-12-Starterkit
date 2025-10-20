<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Get the users for the division.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}