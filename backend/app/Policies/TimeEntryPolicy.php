<?php

namespace App\Policies;

use App\Models\TimeEntry;
use App\Models\User;

class TimeEntryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tasks.manage') || $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
    }

    public function view(User $user, TimeEntry $entry): bool
    {
        return $user->id === $entry->user_id || $user->can('tasks.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('tasks.manage') || $user->hasRole('COLLABORATEUR') || $user->hasRole('ASSISTANT');
    }

    public function update(User $user, TimeEntry $entry): bool
    {
        return $user->id === $entry->user_id || $user->can('tasks.manage');
    }

    public function delete(User $user, TimeEntry $entry): bool
    {
        return $user->can('time.approve') || $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
    }
}
