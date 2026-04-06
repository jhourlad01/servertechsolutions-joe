<?php

namespace App\Domains\IAM\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Class Permission
 * 
 * Defines a granular capability in the system (e.g. issues.view, auth.login).
 * 
 * @package App\Domains\IAM\Models
 */
class Permission extends Model
{
    /**
     * The attributes that are mass assignable.
     * 
     * @var array
     */
    protected $fillable = ['name', 'slug'];

    /**
     * Relationship: Many-to-Many with Roles.
     * 
     * @return BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role');
    }
}
