<?php

namespace Database\Factories;

use App\Domains\Issues\Models\Issue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class IssueFactory
 * 
 * Provides fake data for generating test/development Issue records.
 * 
 * @package Database\Factories
 */
class IssueFactory extends Factory
{
    /**
     * The model the factory corresponds to.
     * 
     * @var string
     */
    protected $model = Issue::class;

    /**
     * Define the model's default state.
     * 
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(3),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'category' => $this->faker->randomElement(['bug', 'feature', 'support', 'ops']),
            'status' => $this->faker->randomElement(['open', 'in_progress', 'resolved', 'closed']),
            'ai_summary' => $this->faker->optional(0.7)->sentence(),
            'ai_next_action' => $this->faker->optional(0.7)->sentence(),
            'is_escalated' => $this->faker->boolean(20),
            'created_at' => now()->subDays(rand(0, 10)),
            'updated_at' => now(),
        ];
    }
}
