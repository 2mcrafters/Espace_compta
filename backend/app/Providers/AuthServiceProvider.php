<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Task;
use App\Models\TimeEntry;
use App\Models\RequestModel;
use App\Policies\ClientPolicy;
use App\Policies\TaskPolicy;
use App\Policies\TimeEntryPolicy;
use App\Policies\PortfolioPolicy;
use App\Policies\RequestPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
    Client::class => ClientPolicy::class,
    \App\Models\Portfolio::class => PortfolioPolicy::class,
        Task::class => TaskPolicy::class,
        TimeEntry::class => TimeEntryPolicy::class,
        RequestModel::class => RequestPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Administrateur / DG has full access
        Gate::before(function ($user, $ability) {
            if (method_exists($user, 'hasRole') && $user->hasRole('ADMIN')) {
                return true;
            }
            return null;
        });

        // Extra abilities for reports/exports not tied to a model
        Gate::define('viewReports', function ($user) {
            return $user->can('reports.view') || $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
        });
        Gate::define('exportTime', function ($user) {
            return $user->can('exports.view') || $user->hasAnyRole(['ADMIN']);
        });
    }
}
