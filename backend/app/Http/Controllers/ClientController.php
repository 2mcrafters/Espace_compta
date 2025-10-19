<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Client::class);
        $clients = Client::query()->latest()->paginate(20);
        return response()->json($clients->through(fn ($c) => $this->transformClient($request->user(), $c)));
    }

    public function show(Request $request, Client $client)
    {
        $this->authorize('view', $client);
        return response()->json($this->transformClient($request->user(), $client));
    }

    public function store(Request $request)
    {
        $this->authorize('create', Client::class);
        $data = $request->validate([
            'portfolio_id' => ['required','exists:portfolios,id'],
            'raison_sociale' => ['required','string','max:255'],
            'rc' => ['nullable','string','max:255'],
            'if' => ['nullable','string','max:255'],
            'ice' => ['nullable','string','max:255'],
            'forme_juridique' => ['nullable','string','max:255'],
            'date_creation' => ['nullable','date'],
            'capital_social' => ['nullable','numeric'],
            'responsable_client' => ['nullable','string','max:255'],
            'telephone' => ['nullable','string','max:30'],
            'email' => ['nullable','email'],
            'type_mission' => ['nullable','string','max:255'],
            'montant_contrat' => ['nullable','numeric'],
        ]);
        $client = Client::create($data);
        return response()->json($this->transformClient($request->user(), $client), 201);
    }

    public function update(Request $request, Client $client)
    {
        $this->authorize('update', $client);
        $data = $request->validate([
            'portfolio_id' => ['sometimes','exists:portfolios,id'],
            'raison_sociale' => ['sometimes','string','max:255'],
            'rc' => ['nullable','string','max:255'],
            'if' => ['nullable','string','max:255'],
            'ice' => ['nullable','string','max:255'],
            'forme_juridique' => ['nullable','string','max:255'],
            'date_creation' => ['nullable','date'],
            'capital_social' => ['nullable','numeric'],
            'responsable_client' => ['nullable','string','max:255'],
            'telephone' => ['nullable','string','max:30'],
            'email' => ['nullable','email'],
            'type_mission' => ['nullable','string','max:255'],
            'montant_contrat' => ['nullable','numeric'],
        ]);
        $client->update($data);
        return response()->json($this->transformClient($request->user(), $client));
    }

    public function destroy(Client $client)
    {
        $this->authorize('delete', $client);
        $client->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function transformClient($user, Client $client): array
    {
        $canViewContract = $user && method_exists($user, 'hasAnyRole') && $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
        return [
            'id' => $client->id,
            'portfolio_id' => $client->portfolio_id,
            'raison_sociale' => $client->raison_sociale,
            'rc' => $client->rc,
            'if' => $client->if,
            'ice' => $client->ice,
            'forme_juridique' => $client->forme_juridique,
            'date_creation' => optional($client->date_creation)->toDateString(),
            'capital_social' => $client->capital_social,
            'responsable_client' => $client->responsable_client,
            'telephone' => $client->telephone,
            'email' => $client->email,
            'type_mission' => $client->type_mission,
            'montant_contrat' => $canViewContract ? $client->montant_contrat : null,
            'created_at' => optional($client->created_at)->toISOString(),
            'updated_at' => optional($client->updated_at)->toISOString(),
        ];
    }
}
