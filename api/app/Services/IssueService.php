<?php

namespace App\Services;

use App\Domains\IAM\Models\UserGroup;
use App\Domains\Issues\Models\Issue;
use App\Models\User;

class IssueService
{
    protected IssueIntelligenceService $intelligenceService;

    public function __construct(IssueIntelligenceService $intelligenceService)
    {
        $this->intelligenceService = $intelligenceService;
    }

    public function createIssue(array $validatedData, string $reporterId): Issue
    {
        $issue = new Issue(array_merge($validatedData, ['reporter_id' => $reporterId]));

        // Round Robin Assignment for non-escalated new issues
        if (empty($issue->assigned_user_id)) {
            $issue->assigned_user_id = $this->findNextAgentForAssignment();
        }

        return $this->saveWithEscalation($issue);
    }

    public function saveWithEscalation(Issue $issue): Issue
    {
        $this->applyEscalationRules($issue);
        $issue->save();

        if (empty($issue->ai_summary)) {
            $data = $this->intelligenceService->generateIssueSummary($issue);

            $issue->update([
                'ai_summary' => $data['summary'],
                'ai_next_action' => $data['action'],
                'assigned_group_id' => UserGroup::where('slug', $data['target_group'])->first()?->id ?? $issue->assigned_group_id,
            ]);
        }

        return $issue;
    }

    /**
     * Business Logic: Automatic Triage & Escalation Rules
     */
    private function applyEscalationRules(Issue $issue): void
    {
        // Set Global SLA Threshold from config (ISSUE_SLA_HOURS env var)
        if (! $issue->exists) {
            $issue->sla_due_at = now()->addHours(config('issues.sla_threshold_hours'));
        }

        // High-Priority / Critical / Overdue Escalation Rule (Plan Mandate)
        $isOverdue = $issue->sla_due_at && $issue->sla_due_at->isPast() && $issue->status_id < 4;
        $isCritical = $issue->priority_id >= config('issues.priorities.critical_threshold');

        if (($isCritical || $isOverdue) && ! $issue->is_escalated) {
            $issue->is_escalated = true;
            $issue->escalated_at = now();

            // Assign to the configured escalation group
            $escalationGroupSlug = config('issues.groups.escalation');
            $escalationGroup = UserGroup::where('slug', $escalationGroupSlug)->first();
            $issue->assigned_group_id = $escalationGroup?->id;

            // Smart Assignment: Pick the least-loaded specialist within the escalation group
            // Counts only open (non-resolved) issues to determine workload
            $specialist = User::whereHas('groups', fn ($q) => $q->where('slug', $escalationGroupSlug))
                ->withCount(['assignedIssues' => fn ($q) => $q->where('status_id', '<', 4)])
                ->orderBy('assigned_issues_count')
                ->first();

            $issue->assigned_user_id = $specialist?->id;
        }
    }

    /**
     * Generates a preview string of the AI summary/action without persisting to DB.
     * Used for the 2-step "Next" flow in the frontend.
     */
    public function previewIntelligence(array $data): array
    {
        // We create a temporary, non-persisted model to reuse the existing intelligence logic
        $issue = new Issue($data);

        return $this->intelligenceService->generateIssueSummary($issue);
    }

    /**
     * Handles the business logic of updating an issue entity.
     */
    public function updateIssue(Issue $issue, array $validatedData): Issue
    {
        $issue->update($validatedData);

        // If business logic expands (e.g. regenerating AI summaries on edit), it would live internally here.
        return $issue;
    }

    public function updateStatus(Issue $issue, int $statusId): Issue
    {
        $issue->update(['status_id' => $statusId]);

        return $issue;
    }

    public function assignToUser(Issue $issue, string $userId): Issue
    {
        $issue->update(['assigned_user_id' => $userId]);

        return $issue;
    }

    public function escalate(Issue $issue, int $priorityId): Issue
    {
        $issue->update([
            'priority_id' => $priorityId,
            'is_escalated' => true,
            'escalated_at' => now(),
        ]);

        return $issue;
    }

    public function findNextAgentForAssignment(): ?string
    {
        $agentGroupSlugs = ['support-agents', 'technicians', 'administrators'];

        $agents = User::whereHas('groups', function ($q) use ($agentGroupSlugs) {
            $q->whereIn('slug', $agentGroupSlugs);
        })->orderBy('id', 'asc')->get();

        if ($agents->isEmpty()) {
            return null;
        }

        $lastAssignedIssue = Issue::whereNotNull('assigned_user_id')
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $lastAssignedIssue) {
            return $agents->first()->id;
        }

        $lastAgentIndex = $agents->search(fn ($agent) => $agent->id === $lastAssignedIssue->assigned_user_id);

        if ($lastAgentIndex === false || $lastAgentIndex === $agents->count() - 1) {
            return $agents->first()->id;
        }

        return $agents->get($lastAgentIndex + 1)->id;
    }
}
