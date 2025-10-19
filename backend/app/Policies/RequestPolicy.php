<?php

namespace App\Policies;

use App\Models\RequestModel;
use App\Models\User;

class RequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('requests.view') || $user->can('requests.manage') || $user->hasAnyRole(['ADMIN','CHEF_EQUIPE','ASSISTANT']);
    }

    public function view(User $user, RequestModel $request): bool
    {
        if ($user->can('requests.manage') || $user->can('requests.view')) return true;
        return $user->id === $request->created_by;
    }

    public function create(User $user): bool
    {
        return $user->can('requests.manage') || $user->hasAnyRole(['ADMIN','ASSISTANT','CHEF_EQUIPE']);
    }

    public function update(User $user, RequestModel $request): bool
    {
        if ($user->can('requests.manage')) return true;
        return $user->id === $request->created_by;
    }

    public function delete(User $user, RequestModel $request): bool
    {
        if ($user->can('requests.manage')) return true;
        return $user->id === $request->created_by;
    }
}
