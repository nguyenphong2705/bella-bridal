<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dress extends Model
{
    protected $fillable = [
        'category_id',
        'code',
        'name',
        'slug',
        'description',
        'material',
        'silhouette',
        'style',
        'color',
        'rental_price',
        'sale_price',
        'is_featured',
        'status',
        'view_count',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'rental_price' => 'integer',
            'sale_price' => 'integer',
            'is_featured' => 'boolean',
            'view_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(DressCategory::class, 'category_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(DressImage::class)->orderByDesc('is_primary')->orderBy('sort_order');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
