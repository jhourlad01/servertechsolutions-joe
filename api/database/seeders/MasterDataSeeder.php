<?php

namespace Database\Seeders;

use App\Domains\Issues\Models\Category;
use App\Domains\Issues\Models\Priority;
use App\Domains\Issues\Models\Status;
use Illuminate\Database\Seeder;

/**
 * Class MasterDataSeeder
 *
 * Populates lookup tables for Priorities, Categories, and Statuses.
 */
class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Priorities (Mandated Tiering)
        $priorities = [
            ['name' => 'Low', 'slug' => 'low', 'color' => '#64748b', 'weight' => 0],
            ['name' => 'Medium', 'slug' => 'medium', 'color' => '#0ea5e9', 'weight' => 50],
            ['name' => 'High', 'slug' => 'high', 'color' => '#f59e0b', 'weight' => 80],
            ['name' => 'Critical', 'slug' => 'critical', 'color' => '#ef4444', 'weight' => 100],
        ];

        foreach ($priorities as $priority) {
            Priority::updateOrCreate(['slug' => $priority['slug']], $priority);
        }

        // 2. Categories (Technical + Operational Mandate)
        $categories = [
            ['name' => 'Technical', 'slug' => 'technical', 'description' => 'Code errors, performance issues, or system behavior'],
            ['name' => 'Account', 'slug' => 'account', 'description' => 'Identity, login, and profile management'],
            ['name' => 'Billing', 'slug' => 'billing', 'description' => 'Subscription, invoicing, and payment inquiries'],
            ['name' => 'Sales', 'slug' => 'sales', 'description' => 'Product inquiries and enterprise sales'],
            ['name' => 'Support', 'slug' => 'support', 'description' => 'General usage questions or help'],
            ['name' => 'Procedural', 'slug' => 'procedural', 'description' => 'Questions regarding company policies or workflow'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }

        // 3. Statuses (Lifecycle Mandate)
        $statuses = [
            ['name' => 'New', 'slug' => 'new', 'is_terminal' => false],
            ['name' => 'In Progress', 'slug' => 'in_progress', 'is_terminal' => false],
            ['name' => 'Escalated', 'slug' => 'escalated', 'is_terminal' => false],
            ['name' => 'Resolved', 'slug' => 'resolved', 'is_terminal' => true],
            ['name' => 'Closed', 'slug' => 'closed', 'is_terminal' => true],
        ];

        foreach ($statuses as $status) {
            Status::updateOrCreate(['slug' => $status['slug']], $status);
        }
    }
}
