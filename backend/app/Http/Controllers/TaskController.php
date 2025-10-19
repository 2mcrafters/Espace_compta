<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Task::class);
        $tasks = Task::with(['client','owner'])->latest()->paginate(20);
        return response()->json($tasks);
    }

    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return response()->json($task->load(['client','owner','assignees']));
    }

    public function store(Request $request)
    {
        $this->authorize('create', Task::class);
        $data = $request->validate([
            'client_id' => ['required','exists:clients,id'],
            'owner_id' => ['nullable','exists:users,id'],
            'category' => ['required','in:COMPTABLE,FISCALE,SOCIALE,JURIDIQUE,AUTRE'],
            'nature' => ['required','in:CONTINUE,PONCTUELLE'],
            'status' => ['nullable','in:EN_ATTENTE,EN_COURS,EN_VALIDATION,TERMINEE'],
            'priority' => ['nullable','integer','min:0','max:255'],
            'progress' => ['nullable','integer','min:0','max:100'],
            'starts_at' => ['nullable','date'],
            'due_at' => ['nullable','date'],
            'notes' => ['nullable','string'],
        ]);
        $task = Task::create($data);
        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        $data = $request->validate([
            'client_id' => ['sometimes','exists:clients,id'],
            'owner_id' => ['nullable','exists:users,id'],
            'category' => ['sometimes','in:COMPTABLE,FISCALE,SOCIALE,JURIDIQUE,AUTRE'],
            'nature' => ['sometimes','in:CONTINUE,PONCTUELLE'],
            'status' => ['sometimes','in:EN_ATTENTE,EN_COURS,EN_VALIDATION,TERMINEE'],
            'priority' => ['sometimes','integer','min:0','max:255'],
            'progress' => ['sometimes','integer','min:0','max:100'],
            'starts_at' => ['sometimes','date','nullable'],
            'due_at' => ['sometimes','date','nullable'],
            'notes' => ['nullable','string'],
        ]);
        $task->update($data);
        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->json(['message' => 'deleted']);
    }

    // POST /tasks/{task}/assign { user_id }
    public function assign(Request $request, Task $task)
    {
        $this->authorize('assign', $task);
        $data = $request->validate([
            'user_id' => ['required','exists:users,id']
        ]);
        $task->assignees()->syncWithoutDetaching([$data['user_id']]);
        return response()->json($task->load('assignees'));
    }
}
