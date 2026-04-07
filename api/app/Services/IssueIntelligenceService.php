<?php

namespace App\Services;

use App\Domains\Issues\Models\Issue;
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
            'ai_next_action' => $data['action']
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
                'prompt' => "Summarize the following issue in one short sentence, then suggest a single next action step. Finally, determine the target internal group for this record: 'Technicians' or 'Support Agents'. " . 
                             "Format: 'Summary: [summary]\nAction: [action]\nGroup: [group]'. " .
                             "Issue Description: " . $issue->description,
                'stream' => false
            ]);

            if ($response->successful()) {
                $text = $response->json('response');
                preg_match('/Summary:\s*(.*?)(?:\n|$)/i', $text, $summaryMatch);
                preg_match('/Action:\s*(.*?)(?:\n|$)/i', $text, $actionMatch);
                preg_match('/Group:\s*(.*?)(?:\n|$)/i', $text, $groupMatch);

                if (!empty($summaryMatch[1]) && !empty($actionMatch[1])) {
                    return [
                        'summary' => trim($summaryMatch[1]),
                        'action' => trim($actionMatch[1]),
                        'target_group' => strtolower(trim($groupMatch[1] ?? 'support-agents'))
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning("AI Generation Failed: " . $e->getMessage());
        }

        // Final Rules-Based Fallback logic now handles Routing too
        return $this->applyRulesBasedFallback($issue);
    }

    private function applyRulesBasedFallback(Issue $issue): array
    {
        $desc = strtolower($issue->description);
        $summary = "General operational request logged.";
        $action = "Assign to a support agent for initial review.";
        $targetGroup = 'support-agents';

        if (str_contains($desc, 'crash') || str_contains($desc, 'down') || str_contains($desc, 'fatal') || str_contains($desc, 'error') || str_contains($desc, 'technical') || str_contains($desc, 'server')) {
            $summary = "Technical system incident or error reported.";
            $action = "Escalate to the Engineering team for structural analysis.";
            $targetGroup = 'technicians';
        } elseif (str_contains($desc, 'login') || str_contains($desc, 'password') || str_contains($desc, 'access') || str_contains($desc, 'account')) {
            $summary = "User authentication or access privilege issue.";
            $action = "Verify user credentials and reset tokens.";
            $targetGroup = 'support-agents';
        } elseif (str_contains($desc, 'billing') || str_contains($desc, 'invoice') || str_contains($desc, 'payment') || str_contains($desc, 'subscription') || str_contains($desc, 'charge')) {
            $summary = "Billing inquiry or payment-related issue.";
            $action = "Escalate to the Finance team for invoice reconciliation.";
            $targetGroup = 'support-agents';
        } elseif (str_contains($desc, 'pricing') || str_contains($desc, 'quote') || str_contains($desc, 'sales') || str_contains($desc, 'enterprise')) {
            $summary = "Pre-sales or enterprise pricing inquiry.";
            $action = "Notify account executive and schedule a follow-up call.";
            $targetGroup = 'support-agents';
        }

        return [
            'summary' => $summary,
            'action' => $action,
            'target_group' => $targetGroup
        ];
    }
}
