<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimeEntryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        // Seed roles and users if seeders exist
        try { $this->artisan('db:seed', ['--class' => 'RolesSeeder']); } catch (\Throwable $e) {}
        try { $this->artisan('db:seed', ['--class' => 'UsersSeeder']); } catch (\Throwable $e) {}
        try { $this->artisan('db:seed', ['--class' => 'TasksTimeEntriesSeeder']); } catch (\Throwable $e) {}
    }

    public function test_user_can_start_and_stop_time_on_assigned_task(): void
    {
        $user = User::first() ?? User::factory()->create();
        $task = Task::factory()->create();
        $task->assignees()->syncWithoutDetaching([$user->id]);

        $this->actingAs($user, 'web');

        $res = $this->postJson("/api/tasks/{$task->id}/time/start", []);
        $res->assertCreated();
        $entryId = $res->json('id');
        $this->assertNotNull($entryId);
        $this->assertDatabaseHas('time_entries', [
            'id' => $entryId,
            'task_id' => $task->id,
            'user_id' => $user->id,
        ]);

        $stopRes = $this->postJson("/api/time-entries/{$entryId}/stop", []);
        $stopRes->assertOk();
        $this->assertNotNull(TimeEntry::find($entryId)->end_at);
    }
}
