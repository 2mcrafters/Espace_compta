<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;

class ClientCollaboratorController extends Controller
{
    public function index(Client $client)
    {
        $this->authorize('view', $client);
        $collabs = $client->collaborators()->select('users.id','users.name','users.email')->get();
        return response()->json($collabs);
    }

    public function store(Request $request, Client $client)
    {
        $this->authorize('update', $client);
        $data = $request->validate(['user_id' => ['required','exists:users,id']]);
        $client->collaborators()->syncWithoutDetaching([$data['user_id']]);
        return response()->json(['message' => 'attached']);
    }

    public function destroy(Client $client, User $user)
    {
        $this->authorize('update', $client);
        $client->collaborators()->detach($user->id);
        return response()->json(['message' => 'detached']);
    }
}
