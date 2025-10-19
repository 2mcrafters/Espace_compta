<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Portfolio;
use Illuminate\Database\Seeder;

class PortfoliosClientsSeeder extends Seeder
{
    public function run(): void
    {
        $p1 = Portfolio::firstOrCreate(['name' => 'Portfolio A'], ['description' => 'Main group A']);
        $p2 = Portfolio::firstOrCreate(['name' => 'Portfolio B'], ['description' => 'Main group B']);

        $clients = [
            ['portfolio_id' => $p1->id, 'raison_sociale' => 'Société Alpha'],
            ['portfolio_id' => $p1->id, 'raison_sociale' => 'Société Beta'],
            ['portfolio_id' => $p1->id, 'raison_sociale' => 'Société Gamma'],
            ['portfolio_id' => $p2->id, 'raison_sociale' => 'Société Delta'],
            ['portfolio_id' => $p2->id, 'raison_sociale' => 'Société Epsilon'],
            ['portfolio_id' => $p2->id, 'raison_sociale' => 'Société Zeta'],
        ];
        foreach ($clients as $c) {
            Client::firstOrCreate(
                ['portfolio_id' => $c['portfolio_id'], 'raison_sociale' => $c['raison_sociale']],
                ['type_mission' => 'Comptable', 'montant_contrat' => 10000]
            );
        }
    }
}
