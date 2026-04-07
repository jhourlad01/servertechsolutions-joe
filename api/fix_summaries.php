<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Domains\Issues\Models\Issue;
use App\Services\IssueService;
use Illuminate\Contracts\Console\Kernel;

$service = app(IssueService::class);
Issue::all()->each(function ($issue) use ($service) {
    if (empty($issue->ai_summary)) {
        $service->saveWithEscalation($issue);
    }
});
echo 'Processed '.Issue::count()." issues.\n";
