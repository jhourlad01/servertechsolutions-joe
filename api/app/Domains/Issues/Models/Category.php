<?php

namespace App\Domains\Issues\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Category
 *
 * Defines issue categories (e.g. bug, feature, support).
 */
class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description'];
}
