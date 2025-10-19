<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\RequestFile;
use App\Models\RequestMessage;
use App\Models\RequestModel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class RequestsSeeder extends Seeder
{
    public function run(): void
    {
        $client = Client::inRandomOrder()->first();
        $creator = User::where('email','assistant@example.com')->first() ?? User::first();

        for ($i=1; $i<=3; $i++) {
            $req = RequestModel::create([
                'client_id' => $client->id,
                'created_by' => $creator->id,
                'title' => 'Pièces comptables '.$i,
                'status' => 'EN_ATTENTE',
                'due_date' => now()->addDays($i*3)->toDateString(),
            ]);

            RequestMessage::create([
                'request_id' => $req->id,
                'user_id' => $creator->id,
                'message_html' => '<p>Merci de fournir les pièces demandées.</p>',
            ]);

            // Create a tiny placeholder file
            $path = 'requests/'.$req->id.'/README.txt';
            Storage::disk('public')->put($path, "Demo file for request #{$req->id}");
            RequestFile::create([
                'request_id' => $req->id,
                'path' => $path,
                'original_name' => 'README.txt',
                'size_bytes' => Storage::disk('public')->size($path),
            ]);
        }
    }
}
