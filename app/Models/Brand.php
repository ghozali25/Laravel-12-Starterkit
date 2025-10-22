<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * The asset categories that belong to the brand.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(AssetCategory::class, 'asset_category_brand');
    }
}