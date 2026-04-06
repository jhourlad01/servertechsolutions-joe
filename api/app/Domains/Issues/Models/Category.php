<?php

namespace App\Domains\Issues\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Category
 * 
 * Defines issue categories (e.g. bug, feature, support).
 * 
 * @package App\Domains\Issues\Models
 */
class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description'];
}
