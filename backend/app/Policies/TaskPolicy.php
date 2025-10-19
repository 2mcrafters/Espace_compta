<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use App\Policies\Concerns\ChecksCollaboration;

class TaskPolicy
{
    use ChecksCollaboration;
    public function viewAny(User $user): bool
    {
        return $user->can('tasks.manage') || $user->hasAnyRole(['ADMIN','CHEF_EQUIPE','COLLABORATEUR']);
    }

    public function view(User $user, Task $task): bool
    {
    return $user->can('tasks.manage')
            || $user->id === $task->owner_id
            || $task->assignees()->where('users.id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']) || $user->can('tasks.manage');
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->hasAnyRole(['ADMIN','CHEF_EQUIPE'])) return true;
        if ($user->can('tasks.manage')) return true;
        return $user->id === $task->owner_id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
    }

    public function assign(User $user, Task $task): bool
    {
        return $user->can('tasks.manage') || $user->id === $task->owner_id;
    }

    public function logTime(User $user, Task $task): bool
    {
        return $user->can('tasks.manage')
            || $user->id === $task->owner_id
            || $task->assignees()->where('users.id', $user->id)->exists();
    }
}
