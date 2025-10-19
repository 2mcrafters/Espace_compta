<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Models\Client;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskQuickEditAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_owner_can_update_status_and_progress()
    {
        $owner = User::factory()->create();
        $owner->assignRole('COLLABORATEUR');
        $client = Client::factory()->create();
        $task = Task::factory()->create([
            'client_id' => $client->id,
            'owner_id' => $owner->id,
            'status' => 'EN_ATTENTE',
            'progress' => 0,
        ]);

        $this->actingAs($owner)
            ->putJson('/api/tasks/'.$task->id, ['status' => 'EN_COURS', 'progress' => 10])
            ->assertOk()
            ->assertJsonFragment(['status' => 'EN_COURS', 'progress' => 10]);
    }

    public function test_non_owner_without_permission_cannot_update()
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $client = Client::factory()->create();
        $task = Task::factory()->create([
            'client_id' => $client->id,
            'owner_id' => $owner->id,
            'status' => 'EN_ATTENTE',
            'progress' => 0,
        ]);

        $this->actingAs($other)
            ->putJson('/api/tasks/'.$task->id, ['status' => 'EN_COURS'])
            ->assertForbidden();
    }

    public function test_manager_with_tasks_manage_can_update()
    {
        $manager = User::factory()->create();
        $manager->assignRole('CHEF_EQUIPE');
        $client = Client::factory()->create();
        $task = Task::factory()->create([
            'client_id' => $client->id,
            'owner_id' => $manager->id,
            'status' => 'EN_ATTENTE',
            'progress' => 0,
        ]);

        $this->actingAs($manager)
            ->putJson('/api/tasks/'.$task->id, ['status' => 'EN_VALIDATION', 'progress' => 50])
            ->assertOk()
            ->assertJsonFragment(['status' => 'EN_VALIDATION', 'progress' => 50]);
    }
}
