<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    public static function getMap(): array
    {
        return static::query()->pluck('value', 'key')->toArray();
    }
}
