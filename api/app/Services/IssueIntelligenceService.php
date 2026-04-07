<?php

namespace App\Services;

use App\Domains\Issues\Models\Category;
use App\Domains\Issues\Models\Issue;
use App\Domains\Issues\Models\Priority;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IssueIntelligenceService
{
    /**
     * Attempts to generate a summary and next action using an LLM.
     * Falls back to a rules-based system if the LLM is unavailable as per assessment requirements.
     */
    public function generateIntelligence(Issue $issue): void
    {
        $data = $this->generateIssueSummary($issue);

        $issue->update([
            'ai_summary' => $data['summary'],
            'ai_next_action' => $data['action'],
        ]);
    }

    /**
     * Internal logic that returns the calculated intelligence without saving it.
     */
    public function generateIssueSummary(Issue $issue): array
    {
        try {
            // Attempt to use local Ollama LLM if running
            $response = Http::timeout(4)->post('http://host.docker.internal:11434/api/generate', [
                'model' => 'llama3',
                'prompt' => "Summarize the following issue in one short sentence, then suggest a single next action step. Finally, determine the target internal group for this record: 'Technicians' or 'Support Agents'. ".
                             "Format: 'Summary: [summary]\nAction: [action]\nGroup: [group]'. ".
                             'Issue Description: '.$issue->description,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $text = $response->json('response');
                preg_match('/Summary:\s*(.*?)(?:\n|$)/i', $text, $summaryMatch);
                preg_match('/Action:\s*(.*?)(?:\n|$)/i', $text, $actionMatch);
                preg_match('/Group:\s*(.*?)(?:\n|$)/i', $text, $groupMatch);

                if (! empty($summaryMatch[1]) && ! empty($actionMatch[1])) {
                    return [
                        'summary' => trim($summaryMatch[1]),
                        'action' => trim($actionMatch[1]),
                        'target_group' => strtolower(trim($groupMatch[1] ?? 'support-agents')),
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('AI Generation Failed: '.$e->getMessage());
        }

        // Final Rules-Based Fallback logic now handles Routing too
        return $this->applyRulesBasedFallback($issue);
    }

    private function applyRulesBasedFallback(Issue $issue): array
    {
        $desc = strtolower($issue->description);
        $title = $issue->title;
        $category = Category::find($issue->category_id)?->name ?? 'General';
        $priority = Priority::find($issue->priority_id)?->name ?? 'Normal';

        // Dynamic summary template using ALL provided fields
        $summary = "New {$category} request regarding \"{$title}\" (Priority: {$priority}). ";
        $action = "Initial triage required for \"{$title}\". Review the provided logs and escalate if necessary.";
        $targetGroup = 'support-agents';

        if (str_contains($desc, 'crash') || str_contains($desc, 'down') || str_contains($desc, 'fatal') || str_contains($desc, 'error') || str_contains($desc, 'technical') || str_contains($desc, 'server')) {
            $summary .= 'Reporter describes a technical failure or system incident. ';
            $action = "Immediate structural analysis of \"{$title}\" required. Check server logs for fatal errors and correlate with reported downtime.";
            $targetGroup = 'technicians';
        } elseif (str_contains($desc, 'billing') || str_contains($desc, 'invoice') || str_contains($desc, 'payment') || str_contains($desc, 'subscription') || str_contains($desc, 'charge') || str_contains($desc, 'paid')) {
            $summary .= "Reporter is flagging a discrepancy in \"{$title}\" related to payments or subscription status. ";
            $action = "Reconcile the payment for \"{$title}\" against the gateway logs. If the record is verified, manually update the account credits and notify the user.";
            $targetGroup = 'support-agents';
        } elseif (str_contains($desc, 'login') || str_contains($desc, 'password') || str_contains($desc, 'access') || str_contains($desc, 'account')) {
            $summary .= "User is reporting an identity or access issue for \"{$title}\". ";
            $action = "Verify user identity and reset tokens for \"{$title}\". Check if the account is locked or requires MFA manual override.";
            $targetGroup = 'support-agents';
        } elseif (str_contains($desc, 'pricing') || str_contains($desc, 'quote') || str_contains($desc, 'sales') || str_contains($desc, 'enterprise')) {
            $summary .= "Commercial inquiry regarding \"{$title}\" detected. Reporter is likely a high-intent enterprise lead. ";
            $action = "Forward \"{$title}\" to the Account Executive. Schedule a Sales call and prepare a custom enterprise quote for the client.";
            $targetGroup = 'support-agents';
        }

        return [
            'summary' => $summary,
            'action' => $action,
            'target_group' => $targetGroup,
        ];
    }
}
