<?php

use App\Http\Controllers\IssueController;
use App\Http\Controllers\IssueMessageController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Lookups
    Route::get('/lookups/statuses', fn () => response()->json(['data' => DB::table('statuses')->get()]));
    Route::get('/lookups/priorities', fn () => response()->json(['data' => DB::table('priorities')->get()]));
    Route::get('/lookups/categories', fn () => response()->json(['data' => DB::table('categories')->get()]));
    Route::get('/lookups/agents', fn () => response()->json(['data' => User::whereHas('groups', fn ($q) => $q->whereIn('slug', ['support-agents', 'technicians', 'administrators']))->get()]));
    Route::get('/iam/lookups', [UserController::class, 'lookups']);

    // Operational Registry (Global)
    Route::post('issues/preview', [IssueController::class, 'preview']);
    Route::get('issues', [IssueController::class, 'index']);
    Route::post('issues', [IssueController::class, 'store']);

    // Issue-Specific (Protected Access)
    Route::middleware(['issue.access'])->group(function () {
        Route::get('issues/{issue}', [IssueController::class, 'show']);
        Route::patch('issues/{issue}', [IssueController::class, 'update']);
        Route::post('issues/{issue}/intelligence', [IssueController::class, 'regenerateIntelligence']);
        Route::patch('issues/{issue}/status', [IssueController::class, 'updateStatus']);
        Route::patch('issues/{issue}/assign', [IssueController::class, 'assignAgent']);
        Route::patch('issues/{issue}/escalate', [IssueController::class, 'escalate']);
        Route::get('issues/{issue}/messages', [IssueMessageController::class, 'index']);
        Route::post('issues/{issue}/messages', [IssueMessageController::class, 'store']);
    });

    Route::apiResource('users', UserController::class);
});

Route::get('uploads/{upload}/download', [IssueMessageController::class, 'download'])
    ->name('uploads.download')
    ->middleware('signed');
