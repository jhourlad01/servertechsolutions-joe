<?php

namespace App\Domains\Issues\Actions;

use App\Domains\Issues\Models\Issue;
use App\Domains\Issues\Services\OllamaService;
use Illuminate\Support\Facades\Log;

/**
 * Class SummarizeIssueAction
 * 
 * A domain-level action that coordinates with OllamaService to generate
 * an intelligent, technical summary of an Issue.
 */
class SummarizeIssueAction
{
    public function __construct(protected OllamaService $ollama) {}

    /**
     * Execute the summarization logic for a specific issue.
     * 
     * @param Issue $issue
     * @return void
     */
    public function execute(Issue $issue): void
    {
        $prompt = $this->buildPrompt($issue);
        $rawResponse = $this->ollama->generate($prompt);

        if (!$rawResponse) {
            Log::warning("AI Summarization failed for Issue: {$issue->id}");
            return;
        }

        $this->parseAndStore($issue, $rawResponse);
    }

    /**
     * Constructs a high-context prompt for the technical LLM.
     */
    protected function buildPrompt(Issue $issue): string
    {
        return <<<PROMPT
            You are a senior systems architect. Summarize the following issue for a technical lead.
            Then suggest a single, high-impact next action.
            
            FORMAT THE RESPONSE AS JSON with keys 'summary' and 'next_action'.
            
            Issue Title: {$issue->title}
            Description Content: 
            ---
            {$issue->description}
            ---
            PROMPT;
    }

    /**
     * Parses the LLM JSON output robustly and updates the Issue state.
     */
    protected function parseAndStore(Issue $issue, string $response): void
    {
        // Extract JSON from potential LLM conversational wrapper
        preg_match('/\{.*?\}/s', $response, $matches);
        $json = $matches[0] ?? '{}';
        
        $data = json_decode($json, true);

        $issue->update([
            'ai_summary' => $data['summary'] ?? 'Summary generation failed.',
            'ai_next_action' => $data['next_action'] ?? 'Manual triage recommended.',
        ]);
        
        Log::info("AI Summary completed for Issue: {$issue->id}");
    }
}
