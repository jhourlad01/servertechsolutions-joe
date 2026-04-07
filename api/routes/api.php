<?php

use App\Http\Controllers\IssueController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Operational Registry
    Route::post('issues/preview', [IssueController::class, 'preview']);
    Route::apiResource('issues', IssueController::class)->except(['destroy']);
});

