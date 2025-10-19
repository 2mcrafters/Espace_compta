<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TimeEntry;
use Illuminate\Http\Request;

class TimeEntryController extends Controller
{
    public function indexForTask(Task $task)
    {
        $this->authorize('view', $task);
        $entries = TimeEntry::with('user')->where('task_id', $task->id)->latest()->paginate(50);
        return response()->json($entries);
    }

    // POST /tasks/{task}/time/start
    public function start(Request $request, Task $task)
    {
        $this->authorize('logTime', $task);
        $data = $request->validate([
            'start_at' => ['nullable','date']
        ]);
        $start = $data['start_at'] ?? now();
        $entry = TimeEntry::create([
            'user_id' => $request->user()->id,
            'task_id' => $task->id,
            'start_at' => $start,
        ]);
        return response()->json($entry, 201);
    }

    // POST /time-entries/{entry}/stop
    public function stop(Request $request, TimeEntry $entry)
    {
        $this->authorize('update', $entry);
        $data = $request->validate([
            'end_at' => ['nullable','date']
        ]);
        $end = $data['end_at'] ?? now();
        $entry->update(['end_at' => $end]);
        return response()->json($entry->refresh());
    }
}
