<?php

namespace App\Console\Commands;

use App\Domains\Issues\Models\Issue;
use App\Services\IssueService;
use Illuminate\Console\Command;

class ProcessOverdueIssues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'issues:escalate-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scans for issues past their SLA window and automatically escalates them.';

    /**
     * Execute the console command.
     */
    public function handle(IssueService $issueService): void
    {
        $this->info('Scanning for overdue issues...');

        // Find all issues where SLA has passed and not yet escalated
        // Priority < 4 (since 4 is critical and auto-escalated immediately)
        $overdueIssues = Issue::where('sla_due_at', '<', now())
            ->where('is_escalated', false)
            ->where('status_id', '<', 4) // Not resolved/closed
            ->get();

        if ($overdueIssues->isEmpty()) {
            $this->info('No overdue issues found.');

            return;
        }

        $this->info('Found '.$overdueIssues->count().' issues requiring escalation.');

        foreach ($overdueIssues as $issue) {
            $this->line("Escalating IS-{$issue->line_number}: {$issue->title}");

            // Re-use logic from the service (Senior-level encapsulation)
            $issueService->saveWithEscalation($issue);
        }

        $this->info('Escalation process complete.');
    }
}
