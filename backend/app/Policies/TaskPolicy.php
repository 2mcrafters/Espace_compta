<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tasks.manage') || $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
    }

    public function view(User $user, Task $task): bool
    {
        return $user->can('tasks.manage')
            || $user->id === $task->owner_id
            || $task->assignees()->where('users.id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->can('tasks.manage');
    }

    public function update(User $user, Task $task): bool
    {
        return $user->can('tasks.manage') || $user->id === $task->owner_id;
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
