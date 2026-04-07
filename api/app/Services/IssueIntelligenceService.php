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
        try {
            // Attempt to use local Ollama LLM if running
            $response = Http::timeout(5)->post('http://host.docker.internal:11434/api/generate', [
                'model' => 'llama3',
                'prompt' => "Summarize the following issue in one short sentence, then suggest a single next action step. Format: 'Summary: [summary]\nAction: [action]'. Issue Description: " . $issue->description,
                'stream' => false
            ]);

            if ($response->successful()) {
                $text = $response->json('response');
                
                // Parse "Summary:" and "Action:"
                preg_match('/Summary:\s*(.*?)(?:\n|$)/i', $text, $summaryMatch);
                preg_match('/Action:\s*(.*?)(?:\n|$)/i', $text, $actionMatch);

                if (!empty($summaryMatch[1]) && !empty($actionMatch[1])) {
                    $issue->update([
                        'ai_summary' => trim($summaryMatch[1]),
                        'ai_next_action' => trim($actionMatch[1])
                    ]);
                    return;
                }
            }
        } catch (\Exception $e) {
            Log::warning("AI Generation Failed, using rule-based fallback. Error: " . $e->getMessage());
        }

        // Graceful Rule-Based Fallback (Assessment Requirement)
        $this->applyRulesBasedFallback($issue);
    }

    private function applyRulesBasedFallback(Issue $issue): void
    {
        $desc = strtolower($issue->description);
        
        $summary = "General operational request logged.";
        $action = "Assign to a Tier 1 agent for initial triage.";

        if (str_contains($desc, 'crash') || str_contains($desc, 'down') || str_contains($desc, 'fatal') || str_contains($desc, 'timeout')) {
            $summary = "Critical system instability or outage reported.";
            $action = "Immediately check server logs and escalate to DevOps.";
        } elseif (str_contains($desc, 'login') || str_contains($desc, 'password') || str_contains($desc, 'access') || str_contains($desc, 'account')) {
            $summary = "User authentication or access privilege issue.";
            $action = "Verify user credentials in IAM and reset access tokens if necessary.";
        } elseif (str_contains($desc, 'slow') || str_contains($desc, 'lag') || str_contains($desc, 'performance')) {
            $summary = "System performance degradation observed.";
            $action = "Review APM metrics and database query execution times.";
        }

        $issue->update([
            'ai_summary' => $summary,
            'ai_next_action' => $action
        ]);
    }
}
