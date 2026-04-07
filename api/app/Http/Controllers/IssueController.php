<?php

namespace App\Http\Controllers;

use App\Domains\Issues\Models\Issue;
use Illuminate\Http\Request;

class IssueController extends Controller
{
    public function index()
    {
        return Issue::with(['category', 'priority', 'status', 'assignedAgent'])
            ->latest()
            ->paginate(15);
    }

    public function show($id)
    {
        $issue = Issue::with(['category', 'priority', 'status', 'assignedAgent'])
            ->findOrFail($id);

        return response()->json(['data' => $issue]);
    }
}
