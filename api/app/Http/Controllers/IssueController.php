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

        $user = $request->user();

        // 1. Global View (Admins/Superadmins with user management authority)
        if (! $user->hasPermission('manage-users')) {
            // 2. Specialty Triage (Agents/Techs) can see assigned or historical
            if ($user->hasPermission(['view-ai-summaries', 'edit-issues'])) {
                $query->where(function ($q) use ($user) {
                    $q->where('assigned_user_id', $user->id)
                        ->orWhereHas('messages', function ($mq) use ($user) {
                            $mq->where('type', 'system')
                                ->where('content', 'like', "%assigned to **{$user->name}**%");
                        });
                });
            } else {
                // 3. Customers (Basic Viewers) can only see what they reported
                $query->where('reporter_id', $user->id);
            }
        }

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
            'data' => $issue->load(['category', 'priority', 'status']),
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

        $this->issueService->updateIssue($issue, $request->validated(), $request->user()->id);

        return response()->json([
            'message' => 'Issue updated successfully.',
            'data' => $issue->load(['category', 'priority', 'status']),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status_id' => 'required|exists:statuses,id']);

        $issue = Issue::findOrFail($id);
        $this->issueService->updateStatus($issue, $request->status_id, $request->user()->id);

        return response()->json([
            'message' => 'Status updated successfully.',
            'data' => $issue->load('status'),
        ]);
    }

    public function assignAgent(Request $request, $id)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $issue = Issue::findOrFail($id);
        $this->issueService->assignToUser($issue, $request->user_id, $request->user()->id);

        return response()->json([
            'message' => 'Agent assigned successfully.',
            'data' => $issue->load('assignedUser'),
        ]);
    }

    public function escalate(Request $request, $id)
    {
        $request->validate(['priority_id' => 'required|exists:priorities,id']);

        $issue = Issue::findOrFail($id);
        $this->issueService->escalate($issue, $request->priority_id, $request->user()->id);

        return response()->json([
            'message' => 'Issue escalated successfully.',
            'data' => $issue->load('priority'),
        ]);
    }

    public function regenerateIntelligence($id)
    {
        $issue = Issue::findOrFail($id);
        $this->issueService->regenerateIntelligence($issue);

        return response()->json([
            'message' => 'Intelligence regenerated successfully.',
            'data' => $issue,
        ]);
    }
}
