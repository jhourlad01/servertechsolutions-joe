<?php

namespace App\Domains\IAM\Traits;

use App\Domains\IAM\Models\Permission;
use App\Domains\IAM\Models\Role;
use App\Domains\IAM\Models\UserGroup;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Trait HasRolesAndGroups
 * 
 * Provides RBAC capabilities to the User model, including many-to-many 
 * relationships with User Groups and Roles.
 * 
 * @package App\Domains\IAM\Traits
 */
trait HasRolesAndGroups
{
    /**
     * Relationship: Many-to-Many with User Groups.
     * 
     * @return BelongsToMany
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(UserGroup::class, 'user_group_user');
    }

    /**
     * Check if the user belongs to a specific group by slug.
     * 
     * @param string $slug
     * @return bool
     */
    public function inGroup(string $slug): bool
    {
        return $this->groups->contains('slug', $slug);
    }

    /**
     * Determine if the user has a specific permission via their groups and roles.
     * 
     * @param string $permissionSlug
     * @return bool
     */
    public function hasPermission(string $permissionSlug): bool
    {
        // Recursively check all permissions across all roles in all user groups
        return $this->groups()->with('roles.permissions')->get()
            ->flatMap(fn($group) => $group->roles)
            ->flatMap(fn($role) => $role->permissions)
            ->contains('slug', $permissionSlug);
    }

    /**
     * Determine if the user has any of the given roles via their groups.
     * 
     * @param array $roleSlugs
     * @return bool
     */
    public function hasAnyRole(array $roleSlugs): bool
    {
        return $this->groups()->with('roles')->get()
            ->flatMap(fn($group) => $group->roles)
            ->contains(fn($role) => in_array($role->slug, $roleSlugs));
    }
}
