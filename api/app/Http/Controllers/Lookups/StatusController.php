<?php

namespace App\Http\Controllers\Lookups;

use App\Domains\Issues\Models\Status;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Status::all()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:statuses,slug',
            'is_terminal' => 'nullable|boolean',
        ]);

        return response()->json(['data' => Status::create($validated)]);
    }

    public function update(Request $request, $id)
    {
        $status = Status::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:statuses,slug,'.$id,
            'is_terminal' => 'nullable|boolean',
        ]);

        $status->update($validated);

        return response()->json(['data' => $status]);
    }

    public function destroy($id)
    {
        Status::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted successfully.']);
    }
}
