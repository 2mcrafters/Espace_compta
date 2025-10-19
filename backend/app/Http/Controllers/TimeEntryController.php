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
            'end_at' => ['nullable','date'],
            'comment' => ['nullable','string','max:2000'],
            'duration_min' => ['nullable','integer','min:1']
        ]);
        $end = $data['end_at'] ?? now();
        $payload = ['end_at' => $end];
        if (array_key_exists('comment', $data)) {
            $payload['comment'] = $data['comment'];
        }
        if (array_key_exists('duration_min', $data)) {
            $payload['duration_min'] = $data['duration_min'];
        }
        $entry->update($payload);
        return response()->json($entry->refresh());
    }
}
