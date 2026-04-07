<?php

namespace App\Domains\Issues\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Class OllamaService
 * 
 * Interacts with the local Ollama LLM container to provide technical summarization.
 */
class OllamaService
{
    protected string $baseUrl;
    protected string $model;

    public function __construct()
    {
        $this->baseUrl = env('OLLAMA_BASE_URL', 'http://ollama:11434');
        $this->model = env('AI_MODEL', 'llama3:8b');
    }

    /**
     * Generate an AI response based on the provided prompt.
     * 
     * @param string $prompt
     * @return string|null
     */
    public function generate(string $prompt): ?string
    {
        try {
            $response = Http::timeout(45)->post("{$this->baseUrl}/api/generate", [
                'model' => $this->model,
                'prompt' => $prompt,
                'stream' => false,
            ]);

            if ($response->successful()) {
                return $response->json('response');
            }

            Log::error("Ollama API Error: " . $response->body());
        } catch (\Exception $e) {
            Log::error("Ollama Connection Error: " . $e->getMessage());
        }

        return null;
    }
}
