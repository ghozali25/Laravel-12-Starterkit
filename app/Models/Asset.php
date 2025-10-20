<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_category_id',
        'user_id',
        'serial_number',
        'brand',
        'model',
        'purchase_date',
        'warranty_end_date',
        'status',
        'notes',
        'custom_fields_data',
        'last_used_at',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_end_date' => 'date',
        'custom_fields_data' => 'array',
        'last_used_at' => 'datetime',
    ];

    /**
     * Get the category that owns the asset.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    /**
     * Get the user (employee) that owns the asset.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}