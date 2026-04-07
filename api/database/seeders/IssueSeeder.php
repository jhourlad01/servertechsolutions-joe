<?php

namespace Database\Seeders;

use App\Domains\Issues\Models\Issue;
use Illuminate\Database\Seeder;

/**
 * Class IssueSeeder
 *
 * Generates initial test data for the Issues domain.
 */
class IssueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate 20 realistic test issues
        Issue::factory()
            ->count(20)
            ->create();
    }
}
