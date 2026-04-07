<?php

namespace App\Http\Controllers\Lookups;

use App\Domains\IAM\Models\UserGroup;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function index()
    {
        return response()->json(['data' => UserGroup::with('roles')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:user_groups,slug',
            'description' => 'nullable|string',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $group = UserGroup::create($validated);

        if ($request->has('role_ids')) {
            $group->roles()->sync($request->role_ids);
        }

        return response()->json(['data' => $group->load('roles')]);
    }

    public function update(Request $request, $id)
    {
        $group = UserGroup::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:user_groups,slug,'.$id,
            'description' => 'nullable|string',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $group->update($validated);

        if ($request->has('role_ids')) {
            $group->roles()->sync($request->role_ids);
        }

        return response()->json(['data' => $group->load('roles')]);
    }

    public function destroy($id)
    {
        UserGroup::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully.']);
    }
}
