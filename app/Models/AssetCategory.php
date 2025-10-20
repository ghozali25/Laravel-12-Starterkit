<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'custom_fields_schema',
    ];

    protected $casts = [
        'custom_fields_schema' => 'array',
    ];

    /**
     * Get the assets for the category.
     */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }
}