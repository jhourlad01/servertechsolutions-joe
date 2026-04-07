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
}
