<?php

namespace App\Domains\IAM\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Class UserGroup
 * 
 * Represents an organizational unit or team (e.g. L1 Support, Engineering).
 * 
 * @package App\Domains\IAM\Models
 */
class UserGroup extends Model
{
    /**
     * The attributes that are mass assignable.
     * 
     * @var array
     */
    protected $fillable = ['name', 'slug', 'description'];

    /**
     * Relationship: Many-to-Many with Users.
     * 
     * @return BelongsToMany
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'user_group_user');
    }

    /**
     * Relationship: Many-to-Many with Roles.
     * Roles are assigned to groups, and users in groups inherit those roles.
     * 
     * @return BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user_group');
    }
}
