<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Master Data (Priorities, Categories, Statuses)
        $this->call(MasterDataSeeder::class);

        // 2. IAM Structure (Roles, Permissions, Users, Groups)
        $this->call(IAMSeeder::class);

        // 3. Issues (Disabled for now as we need to update IssueFactory for the new schema)
        // $this->call(IssueSeeder::class);
    }
}
