<?php

namespace Tests\Feature;

use App\Mail\WelcomeInviteMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserInviteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an admin user and act as them
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        // Bypass auth for API using actingAs
        $this->actingAs($admin);
        // Allow users.edit via gate
        Gate::shouldReceive('authorize')->andReturn(true);
    }

    public function test_create_user_with_invite_sends_mail(): void
    {
        Mail::fake();

        $payload = [
            'email' => 'newuser@example.com',
            'first_name' => 'New',
            'last_name' => 'User',
            'send_invite' => true,
        ];

        $res = $this->postJson('/api/users', $payload);
        $res->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);

        Mail::assertQueued(WelcomeInviteMail::class, function ($mail) {
            return $mail->hasTo('newuser@example.com');
        });
    }

    public function test_create_user_requires_password_without_invite(): void
    {
        $payload = [
            'email' => 'nouser@example.com',
        ];
        $res = $this->postJson('/api/users', $payload);
        $res->assertStatus(422);
        $res->assertJsonValidationErrors(['password']);
    }
}
