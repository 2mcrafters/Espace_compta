<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskAssignmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        try { $this->artisan('db:seed', ['--class' => 'RolesSeeder']); } catch (\Throwable $e) {}
        try { $this->artisan('db:seed', ['--class' => 'UsersSeeder']); } catch (\Throwable $e) {}
    }

    public function test_only_owner_or_manager_can_assign(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $assignee = User::factory()->create();
        $task = Task::factory()->create(['owner_id' => $owner->id]);

        // Other cannot assign
        $this->actingAs($other, 'web');
        $res = $this->postJson("/api/tasks/{$task->id}/assign", ['user_id' => $assignee->id]);
        $res->assertForbidden();

        // Owner can assign
        $this->actingAs($owner, 'web');
        $res2 = $this->postJson("/api/tasks/{$task->id}/assign", ['user_id' => $assignee->id]);
        $res2->assertOk();
        $this->assertDatabaseHas('task_user', [
            'task_id' => $task->id,
            'user_id' => $assignee->id,
        ]);
    }
}
