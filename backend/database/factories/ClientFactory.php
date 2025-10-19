<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Portfolio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition(): array
    {
        return [
            'portfolio_id' => Portfolio::factory(),
            'raison_sociale' => $this->faker->company(),
            'rc' => $this->faker->numerify('RC####'),
            'if' => $this->faker->numerify('IF####'),
            'ice' => $this->faker->numerify('ICE#########'),
            'forme_juridique' => 'SARL',
            'date_creation' => $this->faker->date(),
            'capital_social' => $this->faker->randomFloat(2, 10000, 1000000),
            'responsable_client' => $this->faker->name(),
            'telephone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'type_mission' => 'Comptable',
            'montant_contrat' => $this->faker->randomFloat(2, 1000, 100000),
        ];
    }
}
