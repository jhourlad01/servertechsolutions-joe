<?php

namespace App\Domains\IAM\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Class UserGroup
 *
 * Represents an organizational unit or team (e.g. L1 Support, Engineering).
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
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_group_user');
    }

    /**
     * Relationship: Many-to-Many with Roles.
     * Roles are assigned to groups, and users in groups inherit those roles.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user_group');
    }
}
