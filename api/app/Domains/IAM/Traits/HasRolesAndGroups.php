<?php

namespace App\Domains\IAM\Traits;

use App\Domains\IAM\Models\Role;
use App\Domains\IAM\Models\UserGroup;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRolesAndGroups
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(UserGroup::class, 'user_group_user');
    }

    public function hasPermission(string|array $permissions): bool
    {
        $permissions = (array) $permissions;

        return (bool) array_intersect($permissions, $this->permissionSlugs);
    }

    public function getPermissionSlugsAttribute(): array
    {
        // 1. Direct role permissions
        $direct = $this->roles()->with('permissions')->get()
            ->flatMap(fn ($r) => $r->permissions->pluck('slug'))->toArray();

        // 2. Group role permissions
        $group = $this->groups()->with('roles.permissions')->get()
            ->flatMap(fn ($g) => $g->roles->flatMap(fn ($r) => $r->permissions->pluck('slug')))
            ->toArray();

        return array_unique(array_merge($direct, $group));
    }

    /* Keep roles for UI and provisioning logic */
    public function hasRole(string|array $slugs): bool
    {
        $slugs = (array) $slugs;

        return (bool) array_intersect($slugs, $this->roleSlugs);
    }

    public function getRoleSlugsAttribute(): array
    {
        $direct = $this->roles->pluck('slug')->toArray();
        $group = $this->groups->flatMap(fn ($g) => $g->roles->pluck('slug'))->toArray();

        return array_unique(array_merge($direct, $group));
    }
}
