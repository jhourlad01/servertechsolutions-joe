<?php

namespace App\Http\Middleware;

use App\Domains\Issues\Models\Issue;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IssueAccessMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $issueId = $request->route('issue') ?? $request->route('id');
        if (! $issueId) {
            return $next($request);
        }

        // Find the issue (allowing string UUID or instance)
        $issue = $issueId instanceof Issue ? $issueId : Issue::find($issueId);
        if (! $issue) {
            return $next($request);
        }

        // 1. Global View (Admins/Superadmins with user management authority)
        if ($user->hasPermission('manage-users')) {
            return $next($request);
        }

        // 2. Specialty Triage (Agents/Techs) can see assigned or historical
        if ($user->hasPermission(['view-ai-summaries', 'edit-issues'])) {
            $isAssigned = $issue->assigned_user_id === $user->id;

            $wasAssigned = $issue->messages()
                ->where('type', 'system')
                ->where('content', 'like', "%assigned to **{$user->name}**%")
                ->exists();

            if ($isAssigned || $wasAssigned) {
                return $next($request);
            }

            abort(403, 'Permission denied. You are not assigned to this issue.');
        }

        // 3. Customers (Basic Viewers) can only see what they reported
        if ($issue->reporter_id !== $user->id) {
            abort(403, 'Permission denied. You can only access your own tickets.');
        }

        return $next($request);
    }
}
