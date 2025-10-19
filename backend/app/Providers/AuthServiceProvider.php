<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Task;
use App\Models\TimeEntry;
use App\Policies\ClientPolicy;
use App\Policies\TaskPolicy;
use App\Policies\TimeEntryPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Client::class => ClientPolicy::class,
        Task::class => TaskPolicy::class,
        TimeEntry::class => TimeEntryPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Extra abilities for reports/exports not tied to a model
        Gate::define('viewReports', function ($user) {
            return $user->can('exports.view') || $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
        });
        Gate::define('exportTime', function ($user) {
            return $user->can('exports.view') || $user->hasAnyRole(['ADMIN']);
        });
    }
}
