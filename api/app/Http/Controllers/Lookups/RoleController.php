<?php

namespace App\Http\Controllers\Lookups;

use App\Domains\IAM\Models\Permission;
use App\Domains\IAM\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Role::with('permissions')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:roles,slug',
            'description' => 'nullable|string',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role = Role::create($validated);

        if ($request->has('permission_ids')) {
            $role->permissions()->sync($request->permission_ids);
        }

        return response()->json(['data' => $role->load('permissions')]);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:roles,slug,'.$id,
            'description' => 'nullable|string',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->update($validated);

        if ($request->has('permission_ids')) {
            $role->permissions()->sync($request->permission_ids);
        }

        return response()->json(['data' => $role->load('permissions')]);
    }

    public function destroy($id)
    {
        Role::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully.']);
    }

    public function permissions()
    {
        return response()->json(['data' => Permission::all()]);
    }
}
