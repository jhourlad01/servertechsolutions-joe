<?php

use App\Http\Controllers\IssueController;
use App\Http\Controllers\IssueMessageController;
use App\Models\User;
use Illuminate\Http\Request;
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

    // Operational Registry
    Route::post('issues/preview', [IssueController::class, 'preview']);
    Route::patch('issues/{issue}/status', [IssueController::class, 'updateStatus']);
    Route::patch('issues/{issue}/assign', [IssueController::class, 'assignAgent']);
    Route::patch('issues/{issue}/escalate', [IssueController::class, 'escalate']);
    Route::get('issues/{issue}/messages', [IssueMessageController::class, 'index']);
    Route::post('issues/{issue}/messages', [IssueMessageController::class, 'store']);
    Route::get('uploads/{upload}/download', [IssueMessageController::class, 'download']);
    Route::apiResource('issues', IssueController::class)->except(['destroy']);
});
