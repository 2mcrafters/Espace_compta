<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TimeEntryController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientDocumentController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ClientCollaboratorController;
use App\Http\Controllers\OverviewController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AdminSettingsController;

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
    // Clients collaborators
    Route::get('clients/{client}/collaborators', [ClientCollaboratorController::class, 'index']);
    Route::post('clients/{client}/collaborators', [ClientCollaboratorController::class, 'store']);
    Route::delete('clients/{client}/collaborators/{user}', [ClientCollaboratorController::class, 'destroy']);
    // Portfolios CRUD
    Route::apiResource('portfolios', PortfolioController::class);
    Route::get('portfolios/{portfolio}/collaborators', [PortfolioController::class, 'listCollaborators']);
    Route::post('portfolios/{portfolio}/collaborators', [PortfolioController::class, 'attachCollaborator']);
    Route::delete('portfolios/{portfolio}/collaborators/{user}', [PortfolioController::class, 'detachCollaborator']);
    // Client Documents (GED)
    Route::get('clients/{client}/documents', [ClientDocumentController::class, 'index']);
    Route::post('clients/{client}/documents', [ClientDocumentController::class, 'store']);
    Route::get('clients/{client}/documents/{document}/download', [ClientDocumentController::class, 'download']);
    Route::delete('clients/{client}/documents/{document}', [ClientDocumentController::class, 'destroy']);

        // Tasks CRUD + assign
        Route::apiResource('tasks', TaskController::class);
        Route::post('tasks/{task}/assign', [TaskController::class, 'assign']);

        // Time entries: listing by task and start/stop
    Route::get('time-entries', [TimeEntryController::class, 'index']);
        Route::get('tasks/{task}/time-entries', [TimeEntryController::class, 'indexForTask']);
        Route::post('tasks/{task}/time/start', [TimeEntryController::class, 'start']);
        Route::post('time-entries/{entry}/stop', [TimeEntryController::class, 'stop']);

        // Requests CRUD + file upload/delete
        Route::apiResource('requests', RequestController::class);
        Route::post('requests/{requestModel}/files', [RequestController::class, 'storeFile']);
        Route::delete('requests/{requestModel}/files/{file}', [RequestController::class, 'deleteFile']);
    Route::post('requests/{requestModel}/messages', [RequestController::class, 'addMessage']);
    Route::post('requests/{requestModel}/remind', [RequestController::class, 'remind']);
    Route::get('requests-metrics', [RequestController::class, 'metrics']);

        // Reports and exports
        Route::get('reports/productivity', [ReportController::class, 'productivity']);
    Route::get('reports/timesheet', [ReportController::class, 'timesheet']);
    Route::get('reports/client-costs', [ReportController::class, 'clientCosts']);
        Route::get('exports/time-excel', [ReportController::class, 'timeExcel']);
    // Overview KPIs
    Route::get('overview', [OverviewController::class, 'index']);

    // Users (collaborators)
    Route::post('users', [UsersController::class, 'store']);
    Route::get('users', [UsersController::class, 'index']);
    Route::get('users/{user}', [UsersController::class, 'show']);
    Route::put('users/{user}', [UsersController::class, 'update']);
    Route::post('users/{user}/rate', [UsersController::class, 'setRate']);
    Route::get('users/{user}/stats', [UsersController::class, 'stats']);

        // Users lookup for collaborator assignment
        Route::get('users/lookup', function () {
            return \App\Models\User::query()->select('id','name','email')->orderBy('name')->limit(200)->get();
        });

        // Roles & permissions (admin settings)
        Route::get('roles-permissions', [AdminSettingsController::class, 'index']);
        Route::put('roles/{role}/permissions', [AdminSettingsController::class, 'updateRolePermissions']);
    });
});
