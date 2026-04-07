<?php

use App\Http\Controllers\IssueController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Operational Registry
Route::get('/issues', [IssueController::class, 'index']);
Route::get('/issues/{id}', [IssueController::class, 'show']);
