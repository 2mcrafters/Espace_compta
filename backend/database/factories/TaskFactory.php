<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $categories = ['COMPTABLE','FISCALE','SOCIALE','JURIDIQUE','AUTRE'];
        $natures = ['CONTINUE','PONCTUELLE'];
        $statuses = ['EN_ATTENTE','EN_COURS','EN_VALIDATION','TERMINEE'];

        return [
            'client_id' => Client::factory(),
            'owner_id' => User::factory(),
            'category' => $this->faker->randomElement($categories),
            'nature' => $this->faker->randomElement($natures),
            'status' => $this->faker->randomElement($statuses),
            'priority' => $this->faker->numberBetween(0, 5),
            'progress' => $this->faker->numberBetween(0, 100),
            'starts_at' => $this->faker->optional()->dateTimeBetween('-10 days', '+10 days'),
            'due_at' => $this->faker->optional()->dateTimeBetween('+1 day', '+30 days'),
            'notes' => $this->faker->sentence(),
        ];
    }
}
