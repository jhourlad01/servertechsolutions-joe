<?php

namespace Database\Factories;

use App\Domains\Issues\Models\Category;
use App\Domains\Issues\Models\Issue;
use App\Domains\Issues\Models\Priority;
use App\Domains\Issues\Models\Status;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class IssueFactory
 *
 * Provides fake data for generating test/development Issue records.
 * Aligned with the normalized schema (Priority, Category, Status, User).
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
        $scenarios = [
            [
                'title' => 'Critical: Master Node Node-01 Unresponsive',
                'description' => 'The system is experiencing a total technical failure after the last update. Node-01 has a fatal error on all I/O threads. Complete service down.',
                'category' => 'Technical'
            ],
            [
                'title' => 'Billing: Double Charge on Premium Subscription',
                'description' => 'The customer was charged twice for the month of April. Their invoice #4532 shows two identical line items for the annual seat license.',
                'category' => 'Billing'
            ],
            [
                'title' => 'Sales: Enterprise Quote for 500 Seats',
                'description' => 'A large enterprise customer is requesting a custom quote for 500 seats with SSO integration. Need a sales rep to reach out ASAP.',
                'category' => 'Sales'
            ],
            [
                'title' => 'Account: MFA lockout for Regional Manager',
                'description' => 'The regional manager is unable to login because their MFA device was lost. Need to reset the password and clear authentication tokens.',
                'category' => 'Account'
            ],
            [
                'title' => 'Billing: Subscription Renewal Failed',
                'description' => 'The payment for the monthly subscription was rejected. The stored credit card on the payment gateway seems to have expired.',
                'category' => 'Billing'
            ]
        ];

        $scenario = $this->faker->randomElement($scenarios);
        $desc = $scenario['description'];
        $lowDesc = strtolower($desc);
        
        // Manual "Escalation Logic" (Business Rule Requirement)
        $isEscalated = str_contains($lowDesc, 'technical') || str_contains($lowDesc, 'down') || str_contains($lowDesc, 'outage') || str_contains($lowDesc, 'charge');

        return [
            'id' => Str::uuid(),
            'title' => $scenario['title'],
            'description' => $desc,

            // Normalized Lookup FKs
            'priority_id' => $isEscalated ? 4 : (str_contains($lowDesc, 'renewal') ? 2 : 1),
            'category_id' => Category::where('slug', strtolower($scenario['category']))->first()?->id ?? 1,
            'status_id' => Status::inRandomOrder()->first()?->id ?? 1,

            // Identity FKs
            'reporter_id' => User::inRandomOrder()->first()?->id ?? User::factory(),

            // AI summaries: pre-seeded with neutral values; service overwrites on real usage
            'ai_summary' => null,
            'ai_next_action' => null,

            'is_escalated' => $isEscalated,
            'created_at' => now()->subDays(rand(0, 14)),
            'updated_at' => now(),
        ];
    }
}
