<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Global Issue Management Settings
    |--------------------------------------------------------------------------
    |
    | Centralized configuration for the Issue Intake system to avoid hardcoding
    | values in services as per senior-level engineering practices.
    |
    */

    'sla_threshold_hours' => env('ISSUE_SLA_HOURS', 48),

    'groups' => [
        'default' => 'support-agents',
        'technical' => 'technicians',
        'escalation' => 'technicians',
    ],

    'priorities' => [
        'critical_threshold' => 4,
    ],
];
