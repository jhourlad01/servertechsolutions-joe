<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Factories\IssueFactory;
use App\Domains\Issues\Models\Issue;

/**
 * Class IssueSeeder
 * 
 * Populates the issues table with test records for developer/assessment verification.
 * 
 * @package Database\Seeders
 */
class IssueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * @return void
     */
    public function run(): void
    {
        // Seed 20 issues with realistic random data via Factory
        Issue::factory()->count(20)->create();
    }
}
