<?php

namespace App\Domains\IAM\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class UserPolicy
 * 
 * Implements hierarchical user management authorization logic:
 * - superadmin manages anyone but fellow superadmins.
 * - admin manages everyone but superadmins and fellow admins.
 * 
 * @package App\Domains\IAM\Policies
 */
class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can manage (edit/delete/etc) another user.
     * 
     * @param User $user
     * @param User $target
     * @return bool
     */
    public function manage(User $user, User $target): bool
    {
        // 1. Super Admin Case
        if ($user->hasAnyRole(['superadmin'])) {
            return !$target->hasAnyRole(['superadmin']);
        }

        // 2. Admin Case
        if ($user->hasAnyRole(['admin'])) {
            // Cannot manage superadmins or fellow admins
            return !$target->hasAnyRole(['superadmin', 'admin']);
        }

        return false;
    }
}
