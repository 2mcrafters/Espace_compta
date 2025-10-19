<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ClientDocument;
use App\Models\User;
use App\Models\UserRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ConfidentialityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth.defaults.guard' => 'web']);
        $this->artisan('migrate');
        try { $this->artisan('db:seed', ['--class' => 'RolesSeeder']); } catch (\Throwable $e) {}
        try { $this->artisan('db:seed', ['--class' => 'UsersSeeder']); } catch (\Throwable $e) {}
        try { app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions(); } catch (\Throwable $e) {}
    }

    public function test_user_rate_confidentiality(): void
    {
    $admin = User::factory()->create();
    if (method_exists($admin, 'assignRole')) { $admin->assignRole('ADMIN'); }
    $collab = User::factory()->create();
    if (method_exists($collab, 'assignRole')) { $collab->assignRole('COLLABORATEUR'); }

        UserRate::create([
            'user_id' => $collab->id,
            'effective_from' => now()->subDay()->toDateString(),
            'hourly_rate_mad' => 123.45,
        ]);

        // As collaborator (not privileged) viewing own profile
        $this->actingAs($collab, 'web');
        $res = $this->getJson("/api/users/{$collab->id}");
        $res->assertOk();
        $this->assertNull($res->json('hourly_rate_mad'));

        // As admin viewing collaborator
        $this->actingAs($admin, 'web');
        $res2 = $this->getJson("/api/users/{$collab->id}");
        $res2->assertOk();
        $this->assertEquals(123.45, (float)$res2->json('hourly_rate_mad'));
    }

    public function test_client_documents_confidentiality(): void
    {
        Storage::fake(config('filesystems.default'));
    $admin = User::factory()->create();
    if (method_exists($admin, 'assignRole')) { $admin->assignRole('ADMIN'); }
    if (method_exists($admin, 'givePermissionTo')) { $admin->givePermissionTo(['clients.view','clients.edit']); }
    $collab = User::factory()->create();
    if (method_exists($collab, 'assignRole')) { $collab->assignRole('COLLABORATEUR'); }
    if (method_exists($collab, 'givePermissionTo')) { $collab->givePermissionTo('clients.view'); }
    try { app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions(); } catch (\Throwable $e) {}

    $client = Client::factory()->create();
    // Ensure collaborator is linked to the client for view permission via policy
    try { $client->collaborators()->syncWithoutDetaching([$collab->id]); } catch (\Throwable $e) {}
        $doc = ClientDocument::create([
            'client_id' => $client->id,
            'category' => 'Contrat',
            'title' => 'Contrat Maitre',
            'path' => 'clients/'.$client->id.'/contrat.pdf',
            'mime' => 'application/pdf',
            'size' => 100,
            'uploaded_by' => $admin->id,
            'is_confidential' => true,
        ]);

        // Collaborator cannot see confidential doc in listing
    $this->actingAs($collab, 'web');
        $res = $this->getJson("/api/clients/{$client->id}/documents");
        $res->assertOk();
        $this->assertCount(0, $res->json());

        // Admin can see it
        $this->actingAs($admin, 'web');
        $res2 = $this->getJson("/api/clients/{$client->id}/documents");
        $res2->assertOk();
        $this->assertCount(1, $res2->json());
    }
}
