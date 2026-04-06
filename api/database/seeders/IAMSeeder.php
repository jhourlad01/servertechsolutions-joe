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
 * Populates Roles, Permissions, User Groups and seeded Users with pre-configured access levels.
 * 
 * @package Database\Seeders
 */
class IAMSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * @return void
     */
    public function run(): void
    {
        // 1. Define Permissions
        $permissions = [
            'auth.login' => 'Log into the system',
            'issues.view' => 'View any issue',
            'issues.create' => 'Submit new issues',
            'issues.update' => 'Edit issue details',
            'issues.resolve' => 'Close/Resolve issues',
            'issues.delete' => 'Hard delete issues',
            'issues.escalate' => 'Flag for escalation',
            'ai.summarize' => 'Trigger AI insights',
            'admin.access' => 'Access Admin UI',
            'users.manage' => 'Manage RBAC/Users',
        ];

        foreach ($permissions as $slug => $name) {
            Permission::updateOrCreate(['slug' => $slug], ['name' => $name]);
        }

        // 2. Define Roles and Assign Permissions
        $roleDefinitions = [
            'superadmin' => array_keys($permissions), // All permissions
            'admin' => [
                'auth.login', 'issues.view', 'issues.create', 'issues.update', 
                'issues.resolve', 'issues.escalate', 'ai.summarize', 'admin.access', 'users.manage'
            ],
            'agent' => [
                'auth.login', 'issues.view', 'issues.create', 'issues.update', 
                'issues.resolve', 'issues.escalate', 'ai.summarize'
            ],
            'member' => ['auth.login', 'issues.view', 'issues.create'],
        ];

        foreach ($roleDefinitions as $slug => $permissionSlugs) {
            $role = Role::updateOrCreate(['slug' => $slug], ['name' => ucfirst($slug)]);
            
            // Sync permissions for the role
            $pIds = Permission::whereIn('slug', $permissionSlugs)->pluck('id');
            $role->permissions()->sync($pIds);
        }

        // 3. Define User Groups
        $groups = [
            ['name' => 'L1 Support', 'slug' => 'support-l1', 'role' => 'agent'],
            ['name' => 'Engineering', 'slug' => 'engineering', 'role' => 'agent'],
            ['name' => 'Operations', 'slug' => 'ops', 'role' => 'member'],
        ];

        foreach ($groups as $gData) {
            $group = UserGroup::updateOrCreate(['slug' => $gData['slug']], ['name' => $gData['name']]);
            
            // Assign the default role to this group
            $roleId = Role::where('slug', $gData['role'])->first()->id;
            $group->roles()->syncWithoutDetaching([$roleId]);
        }

        // 4. Seed Users
        $userAccounts = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@servertech.com',
                'role' => 'superadmin',
                'groups' => ['support-l1', 'engineering', 'ops']
            ],
            [
                'name' => 'Main Admin',
                'email' => 'admin@servertech.com',
                'role' => 'admin',
                'groups' => ['support-l1']
            ],
            [
                'name' => 'Support Agent',
                'email' => 'agent@servertech.com',
                'role' => 'agent',
                'groups' => ['support-l1']
            ],
            [
                'name' => 'General Member',
                'email' => 'member@servertech.com',
                'role' => 'member',
                'groups' => ['ops']
            ],
        ];

        foreach ($userAccounts as $acc) {
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
            $user->groups()->sync($gIds);

            // Note: In our current model, Roles are inherits via Groups.
            // If we needed direct Role assignment, we'd add another pivot table 'role_user'.
            // For this assessment, we follow the User -> Group -> Role model.
        }

        // Ensure Super Admin group has the SuperAdmin Role
        $saGroup = UserGroup::updateOrCreate(['slug' => 'admins'], ['name' => 'Admins']);
        $saRole = Role::where('slug' => 'superadmin')->first();
        $saGroup->roles()->sync([$saRole->id]);
        
        $superUser = User::where('email', 'superadmin@servertech.com')->first();
        $superUser->groups()->syncWithoutDetaching([$saGroup->id]);
    }
}
