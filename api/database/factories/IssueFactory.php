<?php

namespace Database\Factories;

use App\Domains\Issues\Models\Issue;
use App\Domains\Issues\Models\Priority;
use App\Domains\Issues\Models\Category;
use App\Domains\Issues\Models\Status;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class IssueFactory
 * 
 * Provides fake data for generating test/development Issue records.
 * Aligned with the normalized schema (Priority, Category, Status, User).
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
            
            // Normalized Lookup FKs
            'priority_id' => Priority::inRandomOrder()->first()?->id ?? 1,
            'category_id' => Category::inRandomOrder()->first()?->id ?? 1,
            'status_id' => Status::inRandomOrder()->first()?->id ?? 1,

            // Identity FKs
            'reporter_id' => User::inRandomOrder()->first()?->id ?? User::factory(),

            // AI Generated Fields
            'ai_summary' => $this->faker->optional(0.7)->sentence(),
            'ai_next_action' => $this->faker->optional(0.7)->sentence(),
            
            'is_escalated' => $this->faker->boolean(20),
            'created_at' => now()->subDays(rand(0, 10)),
            'updated_at' => now(),
        ];
    }
}
