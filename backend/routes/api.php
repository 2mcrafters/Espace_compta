<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TimeEntryController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProfileController;

// Health
Route::get('/ping', function () {
    return response()->json(['status' => 'ok']);
});

// Auth (Sanctum session-based)
Route::middleware(['web'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Protected API routes requiring an authenticated session
    Route::middleware('auth')->group(function () {
        // Profile
        Route::get('profile/me', [ProfileController::class, 'me']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::post('profile/password', [ProfileController::class, 'changePassword']);
        // Clients CRUD
        Route::apiResource('clients', ClientController::class);

        // Tasks CRUD + assign
        Route::apiResource('tasks', TaskController::class);
        Route::post('tasks/{task}/assign', [TaskController::class, 'assign']);

        // Time entries: listing by task and start/stop
        Route::get('tasks/{task}/time-entries', [TimeEntryController::class, 'indexForTask']);
        Route::post('tasks/{task}/time/start', [TimeEntryController::class, 'start']);
        Route::post('time-entries/{entry}/stop', [TimeEntryController::class, 'stop']);

        // Requests CRUD + file upload/delete
        Route::apiResource('requests', RequestController::class);
        Route::post('requests/{requestModel}/files', [RequestController::class, 'storeFile']);
        Route::delete('requests/{requestModel}/files/{file}', [RequestController::class, 'deleteFile']);

        // Reports and exports
        Route::get('reports/productivity', [ReportController::class, 'productivity']);
        Route::get('exports/time-excel', [ReportController::class, 'timeExcel']);
    });
});
