<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PortfolioController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Portfolio::class);
        $data = Portfolio::query()->withCount('clients')->latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'clients_count' => $p->clients_count,
            ];
        });
        return response()->json($data);
    }

    public function show(Portfolio $portfolio)
    {
        $this->authorize('view', $portfolio);
        $portfolio->load(['clients:id,portfolio_id,raison_sociale', 'collaborators:id,name,email']);
        return response()->json([
            'id' => $portfolio->id,
            'name' => $portfolio->name,
            'description' => $portfolio->description,
            'clients' => $portfolio->clients,
            'collaborators' => $portfolio->collaborators,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Portfolio::class);
        $data = $request->validate([
            'name' => ['required','string','max:255','unique:portfolios,name'],
            'description' => ['nullable','string'],
        ]);
        $p = Portfolio::create($data);
        return response()->json($p, 201);
    }

    public function update(Request $request, Portfolio $portfolio)
    {
        $this->authorize('update', $portfolio);
        $data = $request->validate([
            'name' => ['sometimes','string','max:255','unique:portfolios,name,'.$portfolio->id],
            'description' => ['nullable','string'],
        ]);
        $portfolio->update($data);
        return response()->json($portfolio);
    }

    public function destroy(Portfolio $portfolio)
    {
        $this->authorize('delete', $portfolio);
        $portfolio->delete();
        return response()->json(['message' => 'deleted']);
    }

    public function listCollaborators(Portfolio $portfolio)
    {
        $this->authorize('view', $portfolio);
        return response()->json($portfolio->collaborators()->select('users.id','users.name','users.email')->get());
    }

    public function attachCollaborator(Request $request, Portfolio $portfolio)
    {
        $this->authorize('update', $portfolio);
        $data = $request->validate(['user_id' => ['required','exists:users,id']]);
        $portfolio->collaborators()->syncWithoutDetaching([$data['user_id']]);
        return response()->json(['message' => 'attached']);
    }

    public function detachCollaborator(Portfolio $portfolio, User $user)
    {
        $this->authorize('update', $portfolio);
        $portfolio->collaborators()->detach($user->id);
        return response()->json(['message' => 'detached']);
    }
}
