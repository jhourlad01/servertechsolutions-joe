<?php

namespace App\Services;

use App\Domains\Issues\Models\Issue;
use App\Domains\IAM\Models\UserGroup;
use Illuminate\Support\Str;

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
                'assigned_group_id' => UserGroup::where('slug', $data['target_group'])->first()?->id ?? $issue->assigned_group_id
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
        if (!$issue->exists) {
            $issue->sla_due_at = now()->addHours(config('issues.sla_threshold_hours'));
        }

        // High-Priority / Critical / Overdue Escalation Rule (Plan Mandate)
        $isOverdue = $issue->sla_due_at && $issue->sla_due_at->isPast() && $issue->status_id < 4;
        $isCritical = $issue->priority_id >= config('issues.priorities.critical_threshold');

        if (($isCritical || $isOverdue) && !$issue->is_escalated) {
            $issue->is_escalated = true;
            $issue->escalated_at = now();

            // Assign to the configured escalation group
            $escalationGroupSlug = config('issues.groups.escalation');
            $escalationGroup = UserGroup::where('slug', $escalationGroupSlug)->first();
            $issue->assigned_group_id = $escalationGroup?->id;

            // Smart Assignment: Pick the least-loaded specialist within the escalation group
            // Counts only open (non-resolved) issues to determine workload
            $specialist = \App\Models\User::whereHas('groups', fn($q) => $q->where('slug', $escalationGroupSlug))
                ->withCount(['assignedIssues' => fn($q) => $q->where('status_id', '<', 4)])
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
}
