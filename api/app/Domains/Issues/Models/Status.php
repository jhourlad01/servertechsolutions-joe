<?php

namespace App\Domains\Issues\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Status
 * 
 * Defines issue status lifecycle states (e.g. open, in_progress, resolved).
 * 
 * @package App\Domains\Issues\Models
 */
class Status extends Model
{
    protected $table = 'statuses';
    protected $fillable = ['name', 'slug', 'is_terminal'];
}
