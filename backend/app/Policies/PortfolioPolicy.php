<?php

namespace App\Policies;

use App\Models\Portfolio;
use App\Models\User;
use App\Policies\Concerns\ChecksCollaboration;

class PortfolioPolicy
{
    use ChecksCollaboration;

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['ADMIN','CHEF_EQUIPE','ASSISTANT','COLLABORATEUR']) || $user->can('portfolios.view');
    }

    public function view(User $user, Portfolio $portfolio): bool
    {
        if ($user->hasAnyRole(['ADMIN','CHEF_EQUIPE'])) return true;
        if ($user->can('portfolios.view')) return true;
        return $this->isCollaboratorForPortfolio($user, $portfolio);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('ADMIN') || $user->can('portfolios.edit');
    }

    public function update(User $user, Portfolio $portfolio): bool
    {
        if ($user->hasRole('ADMIN')) return true;
        if ($user->can('portfolios.edit')) return true;
        return false;
    }

    public function delete(User $user, Portfolio $portfolio): bool
    {
        return $user->hasRole('ADMIN');
    }
}
