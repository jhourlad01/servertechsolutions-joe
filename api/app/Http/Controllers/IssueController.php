<?php

namespace App\Http\Controllers;

use App\Domains\Issues\Models\Issue;
use App\Http\Requests\StoreIssueRequest;
use App\Services\IssueService;
use Illuminate\Http\Request;

class IssueController extends Controller
{
    protected IssueService $issueService;

    public function __construct(IssueService $issueService)
    {
        $this->issueService = $issueService;
    }

    public function index(Request $request)
    {
        $query = Issue::with(['category', 'priority', 'status', 'assignedUser']);

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

    public function store(StoreIssueRequest $request)
    {
        $issue = $this->issueService->createIssue(
            $request->validated(), 
            $request->user()->id
        );

        return response()->json([
            'message' => 'Issue created successfully.',
            'data' => $issue->load(['category', 'priority', 'status'])
        ], 201);
    }

    public function show($id)
    {
        $issue = Issue::with(['category', 'priority', 'status', 'assignedUser'])
            ->findOrFail($id);

        return response()->json(['data' => $issue]);
    }

    public function preview(Request $request)
    {
        $data = $this->issueService->previewIntelligence($request->all());

        return response()->json(['data' => $data]);
    }

    public function update(StoreIssueRequest $request, $id)
    {
        $issue = Issue::findOrFail($id);
        
        $this->issueService->updateIssue($issue, $request->validated());

        return response()->json([
            'message' => 'Issue updated successfully.',
            'data' => $issue->load(['category', 'priority', 'status'])
        ]);
    }
}


