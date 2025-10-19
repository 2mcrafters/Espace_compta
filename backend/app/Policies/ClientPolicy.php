<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use App\Policies\Concerns\ChecksCollaboration;

class ClientPolicy
{
    use ChecksCollaboration;
    public function viewAny(User $user): bool
    {
        return $user->can('clients.view');
    }

    public function view(User $user, Client $client): bool
    {
        if ($user->hasAnyRole(['ADMIN','CHEF_EQUIPE'])) return true;
        if ($user->can('clients.view')) return true;
        // collaborators can view their assigned client/portfolio
        return $this->isCollaboratorForClient($user, $client);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('ADMIN') || $user->can('clients.edit');
    }

    public function update(User $user, Client $client): bool
    {
        if ($user->hasRole('ADMIN')) return true;
        if ($user->can('clients.edit')) return true;
        // Team leads can update if collaborator for this dossier/portfolio
        if ($user->hasRole('CHEF_EQUIPE')) {
            return $this->isCollaboratorForClient($user, $client);
        }
        return false;
    }

    public function delete(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
    }
}
