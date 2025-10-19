<?php

namespace App\Policies\Concerns;

use App\Models\Client;
use App\Models\Portfolio;
use App\Models\User;

trait ChecksCollaboration
{
    protected function isCollaboratorForClient(User $user, Client $client): bool
    {
        // direct collaborator on client or collaborator on client's portfolio
        return $client->collaborators()->where('users.id', $user->id)->exists()
            || ($client->portfolio && $client->portfolio->collaborators()->where('users.id', $user->id)->exists());
    }

    protected function isCollaboratorForPortfolio(User $user, Portfolio $portfolio): bool
    {
        return $portfolio->collaborators()->where('users.id', $user->id)->exists();
    }
}
