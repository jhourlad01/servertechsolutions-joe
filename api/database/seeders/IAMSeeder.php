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

        // 2. Create Roles and assign permissions (Mandated Tiered Access)
        $rolesData = [
            'superadmin' => $permissions,
            'admin' => ['manage-users', 'view-issues', 'create-issues', 'edit-issues', 'view-ai-summaries', 'escalate-issues'],
            'technician' => ['view-issues', 'edit-issues', 'view-ai-summaries'],
            'agent' => ['view-issues', 'edit-issues', 'view-ai-summaries'],
            'customer' => ['view-issues', 'create-issues'],
        ];

        foreach ($rolesData as $slug => $perms) {
            $role = Role::updateOrCreate(['slug' => $slug], ['name' => ucfirst($slug)]);
            $pIds = Permission::whereIn('slug', $perms)->pluck('id');
            $role->permissions()->sync($pIds);
        }

        // 3. Create Hierarchical Groups
        $groupsData = [
            'administrators' => ['superadmin', 'admin'],
            'technicians' => ['technician'],
            'support-agents' => ['agent'],
            'customers' => ['customer'],
        ];

        foreach ($groupsData as $slug => $roleSlugs) {
            $group = UserGroup::updateOrCreate(['slug' => $slug], ['name' => ucfirst(str_replace('-', ' ', $slug))]);
            $rIds = Role::whereIn('slug', $roleSlugs)->pluck('id');
            $group->roles()->sync($rIds);
        }

        // 4. Create Initial Seed Users (Provision for Escalation Flow)
        $users = [
            [
                'name' => 'System SuperAdmin',
                'email' => 'superadmin@servertech.com',
                'groups' => ['administrators'],
            ],
            /*
            [
                'name' => 'System Admin',
                'email' => 'admin@servertech.com',
                'groups' => ['administrators'],
            ],
            [
                'name' => 'Isaac Clarke',
                'email' => 'isaac.c@servertech.com',
                'groups' => ['technicians'],
            ],
            [
                'name' => 'Sarah Chen',
                'email' => 'sarah.c@servertech.com',
                'groups' => ['support-agents'],
            ],
            [
                'name' => 'John Wick (Global Ops)',
                'email' => 'wick@customera.com',
                'groups' => ['customers'],
            ],
            [
                'name' => 'Ellen Ripley (Weyland Corp)',
                'email' => 'ripley@customerb.com',
                'groups' => ['customers'],
            ],
            */
        ];

        foreach ($users as $acc) {
            $user = User::updateOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Assign to groups
            $gIds = UserGroup::whereIn('slug', $acc['groups'])->pluck('id');

            if (! method_exists($user, 'groups')) {
                $this->command->error("The 'groups()' relationship represents a missing method on ".get_class($user));
                $this->command->warn('Available traits: '.implode(', ', class_uses_recursive($user)));

                continue;
            }

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
