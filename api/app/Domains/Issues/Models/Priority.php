<?php

namespace App\Domains\Issues\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Priority
 *
 * Defines issue priority levels (e.g. low, medium, high, urgent).
 */
class Priority extends Model
{
    protected $fillable = ['name', 'slug', 'color', 'weight'];
}
