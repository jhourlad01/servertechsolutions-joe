<?php

namespace App\Http\Controllers\Lookups;

use App\Domains\Issues\Models\Priority;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PriorityController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Priority::all()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:priorities,slug',
            'color' => 'nullable|string',
            'weight' => 'nullable|integer',
        ]);

        return response()->json(['data' => Priority::create($validated)]);
    }

    public function update(Request $request, $id)
    {
        $priority = Priority::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:priorities,slug,'.$id,
            'color' => 'nullable|string',
            'weight' => 'nullable|integer',
        ]);

        $priority->update($validated);

        return response()->json(['data' => $priority]);
    }

    public function destroy($id)
    {
        Priority::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully.']);
    }
}
