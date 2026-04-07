<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Domains\IAM\Models\Role;
use App\Domains\IAM\Models\UserGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class UserController extends Controller
{
    private function authorizeProvisioning(Request $request, array $targetRoleIds)
    {
        $actor = $request->user();
        if (!$actor) return;

        $targetRoles = Role::whereIn('id', $targetRoleIds)->get();
        $actorRoles = $actor->roles->pluck('slug')->toArray();

        // Superadmins can't create/update other Superadmins
        if (in_array('superadmin', $actorRoles)) {
            if ($targetRoles->contains('slug', 'superadmin')) {
                throw new AccessDeniedHttpException("Superadmins cannot provision other Superadmins.");
            }
        }

        // Admins can't create/update Superadmins or other Admins
        if (in_array('admin', $actorRoles) && !in_array('superadmin', $actorRoles)) {
            if ($targetRoles->contains('slug', 'superadmin') || $targetRoles->contains('slug', 'admin')) {
                throw new AccessDeniedHttpException("Admins can only provision Technicians, Agents, or Customers.");
            }
        }
    }

    public function index()
    {
        return response()->json([
            'data' => User::with(['roles', 'groups'])->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'group_ids' => 'nullable|array',
            'group_ids.*' => 'exists:user_groups,id',
        ]);

        if (!empty($validated['role_ids'])) {
            $this->authorizeProvisioning($request, $validated['role_ids']);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (!empty($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        if (!empty($validated['group_ids'])) {
            $user->groups()->sync($validated['group_ids']);
        }

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user->load(['roles', 'groups'])
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'group_ids' => 'nullable|array',
            'group_ids.*' => 'exists:user_groups,id',
        ]);

        if (isset($validated['role_ids'])) {
            $this->authorizeProvisioning($request, $validated['role_ids']);
        }

        $user->update(array_filter([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'password' => !empty($validated['password']) ? Hash::make($validated['password']) : null,
        ]));

        if (isset($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        if (isset($validated['group_ids'])) {
            $user->groups()->sync($validated['group_ids']);
        }

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $user->load(['roles', 'groups'])
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->email === 'superadmin@servertech.com') {
            return response()->json(['message' => 'The Superadmin system identity cannot be deleted.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function lookups()
    {
        return response()->json([
            'roles' => Role::all(),
            'groups' => UserGroup::all(),
        ]);
    }
}
