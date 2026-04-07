<?php

namespace App\Domains\IAM\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Class Role
 *
 * Defines a structural role in the system (e.g. superadmin, admin, agent, member).
 */
class Role extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'slug'];

    /**
     * Relationship: Many-to-Many with Permissions.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    /**
     * Relationship: Many-to-Many with User Groups.
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(UserGroup::class, 'role_user_group');
    }
}
