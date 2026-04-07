<?php

namespace Database\Seeders;

use App\Domains\IAM\Models\Permission;
use App\Domains\IAM\Models\Role;
use App\Domains\IAM\Models\UserGroup;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Class IAMSeeder
 *
 * Seeder to initialize the hierarchical Identity and Access Management structure.
 */
class IAMSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Permissions
        $permissions = [
            'manage-users',
            'manage-roles',
            'view-issues',
            'create-issues',
            'edit-issues',
            'delete-issues',
            'view-ai-summaries',
            'escalate-issues',
        ];

        foreach ($permissions as $slug) {
            Permission::updateOrCreate(
                ['slug' => $slug],
                ['name' => str_replace('-', ' ', ucfirst($slug))]
            );
        }

        // 2. Create Roles and assign permissions
        $rolesData = [
            'superadmin' => $permissions, // Everything
            'admin' => ['manage-users', 'view-issues', 'create-issues', 'edit-issues', 'view-ai-summaries', 'escalate-issues'],
            'agent' => ['view-issues', 'edit-issues', 'view-ai-summaries'],
            'member' => ['view-issues', 'create-issues'],
        ];

        foreach ($rolesData as $slug => $perms) {
            $role = Role::updateOrCreate(['slug' => $slug], ['name' => ucfirst($slug)]);
            $pIds = Permission::whereIn('slug', $perms)->pluck('id');
            $role->permissions()->sync($pIds);
        }

        // 3. Create Hierarchical Groups
        $groupsData = [
            'administrators' => ['superadmin', 'admin'],
            'support-agents' => ['agent'],
            'end-users' => ['member'],
        ];

        foreach ($groupsData as $slug => $roleSlugs) {
            $group = UserGroup::updateOrCreate(['slug' => $slug], ['name' => ucfirst(str_replace('-', ' ', $slug))]);
            $rIds = Role::whereIn('slug', $roleSlugs)->pluck('id');
            $group->roles()->sync($rIds);
        }

        // 4. Create Initial Seed Users
        $users = [
            [
                'name' => 'System SuperAdmin',
                'email' => 'superadmin@servertech.com',
                'groups' => ['administrators'],
            ],
            [
                'name' => 'Lead Admin',
                'email' => 'admin@servertech.com',
                'groups' => ['administrators'],
            ],
            [
                'name' => 'Agent Smith',
                'email' => 'agent@servertech.com',
                'groups' => ['support-agents'],
            ],
            [
                'name' => 'Regular User',
                'email' => 'member@servertech.com',
                'groups' => ['end-users'],
            ],
        ];

        foreach ($users as $acc) {
            $user = User::updateOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'password' => Hash::make('password'),
                ]
            );

            // Assign to groups
            $gIds = UserGroup::whereIn('slug', $acc['groups'])->pluck('id');
            $user->groups()->sync($gIds);
        }

        // Ensure Super Admin group has the SuperAdmin Role (Final sync)
        $saGroup = UserGroup::where('slug', 'administrators')->first();
        if ($saGroup) {
            $saRole = Role::where('slug', 'superadmin')->first();
            if ($saRole) {
                $saGroup->roles()->syncWithoutDetaching([$saRole->id]);
            }
        }

        $superUser = User::where('email', 'superadmin@servertech.com')->first();
        if ($superUser && $saGroup) {
            $superUser->groups()->syncWithoutDetaching([$saGroup->id]);
        }
    }
}
