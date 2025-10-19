<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Task;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Database\Seeder;

class TasksTimeEntriesSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::inRandomOrder()->take(6)->get();
        $owner = User::where('email','chef@example.com')->first() ?? User::first();
        $assignee = User::where('email','collab@example.com')->first() ?? User::first();

        $categories = ['COMPTABLE','FISCALE','SOCIALE','JURIDIQUE','AUTRE'];
        $statuses = ['EN_ATTENTE','EN_COURS','EN_VALIDATION','TERMINEE'];

        $tasks = collect();
        for ($i=1; $i<=10; $i++) {
            $client = $clients[$i % max(1, $clients->count())];
            $task = Task::create([
                'client_id' => $client->id,
                'owner_id' => $owner?->id,
                'category' => $categories[$i % count($categories)],
                'nature' => $i % 2 === 0 ? 'CONTINUE' : 'PONCTUELLE',
                'status' => $statuses[$i % count($statuses)],
                'priority' => rand(0,5),
                'progress' => rand(0,100),
                'starts_at' => now()->subDays(rand(1,30)),
                'due_at' => now()->addDays(rand(1,30)),
                'notes' => 'Demo task #'.$i,
            ]);
            $task->assignees()->syncWithoutDetaching([$assignee->id]);
            $tasks->push($task);
        }

        // A few time entries for first three tasks
        $user = $assignee;
        foreach ($tasks->take(3) as $task) {
            TimeEntry::create([
                'user_id' => $user->id,
                'task_id' => $task->id,
                'start_at' => now()->subHours(3),
                'end_at' => now()->subHours(1),
                'duration_min' => 120,
                'comment' => 'Initial work',
            ]);
        }
    }
}
