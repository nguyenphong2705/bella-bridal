<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'customer_name',
        'customer_avatar',
        'service_used',
        'rating',
        'content',
        'wedding_date',
        'is_featured',
        'is_approved',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_featured' => 'boolean',
            'is_approved' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
