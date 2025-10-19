<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_admin_can_view_and_update_portfolio()
    {
        $admin = User::factory()->create();
        $admin->assignRole('ADMIN');
        $portfolio = Portfolio::factory()->create();

        $this->actingAs($admin);
        $this->getJson('/api/portfolios/'.$portfolio->id)->assertOk();
        $this->putJson('/api/portfolios/'.$portfolio->id, ['description' => 'X'])->assertOk();
    }

    public function test_collaborator_can_view_but_not_update()
    {
        $user = User::factory()->create();
        $user->assignRole('COLLABORATEUR');
        $portfolio = Portfolio::factory()->create();
        $portfolio->collaborators()->syncWithoutDetaching([$user->id]);

        $this->actingAs($user);
        $this->getJson('/api/portfolios/'.$portfolio->id)->assertOk();
        $this->putJson('/api/portfolios/'.$portfolio->id, ['description' => 'X'])->assertForbidden();
    }

    public function test_unrelated_user_forbidden()
    {
        $user = User::factory()->create();
        $portfolio = Portfolio::factory()->create();

        $this->actingAs($user);
        $this->getJson('/api/portfolios/'.$portfolio->id)->assertForbidden();
    }
}
