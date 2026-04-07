<?php

namespace App\Http\Controllers;

use App\Domains\Issues\Models\Issue;
use App\Http\Requests\StoreIssueRequest;
use App\Services\IssueIntelligenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class IssueController extends Controller
{
    public function index(Request $request)
    {
        $query = Issue::with(['category', 'priority', 'status', 'assignedAgent']);

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('priority_id')) {
            $query->where('priority_id', $request->priority_id);
        }

        return $query->latest()->paginate(15);
    }

    public function store(StoreIssueRequest $request, IssueIntelligenceService $intelligenceService)
    {
        $issue = Issue::create(array_merge(
            $request->validated(),
            [
                'identification_number' => 'IS-' . strtoupper(Str::random(6)),
                'reporter_user_id' => $request->user()->id,
            ]
        ));

        // Call the AI / Automation Service to generate summary & next action
        $intelligenceService->generateIntelligence($issue);

        return response()->json([
            'message' => 'Issue created successfully.',
            'data' => $issue->load(['category', 'priority', 'status'])
        ], 201);
    }

    public function show($id)
    {
        $issue = Issue::with(['category', 'priority', 'status', 'assignedAgent'])
            ->findOrFail($id);

        return response()->json(['data' => $issue]);
    }
}

