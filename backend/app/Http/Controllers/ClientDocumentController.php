<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClientDocumentController extends Controller
{
    public function index(Request $request, Client $client)
    {
        $this->authorize('view', $client);
        $q = $client->documents()->latest()->with('user:id,name');
        // If not privileged, hide confidential documents
        $user = $request->user();
        $canViewConf = $user && method_exists($user, 'hasAnyRole') && $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
        if (!$canViewConf) {
            $q->where('is_confidential', false);
        }
        $docs = $q->get();
        return response()->json($docs);
    }

    public function store(Request $request, Client $client)
    {
        $this->authorize('update', $client);
        $request->validate([
            'file' => ['required','file'],
            'category' => ['nullable','string','max:100'],
            'title' => ['nullable','string','max:255'],
            'is_confidential' => ['nullable','boolean'],
        ]);
        $file = $request->file('file');
        $path = $file->store("clients/{$client->id}", config('filesystems.default'));
        $doc = ClientDocument::create([
            'client_id' => $client->id,
            'category' => $request->input('category'),
            'title' => $request->input('title') ?: ($file->getClientOriginalName() ?: basename($path)),
            'path' => $path,
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => optional($request->user())->id,
            'is_confidential' => (bool) $request->boolean('is_confidential'),
        ]);
        return response()->json($doc, 201);
    }

    public function download(Client $client, ClientDocument $document)
    {
        $this->authorize('view', $client);
        abort_if($document->client_id !== $client->id, 404);
        $user = request()->user();
        $canViewConf = $user && method_exists($user, 'hasAnyRole') && $user->hasAnyRole(['ADMIN','CHEF_EQUIPE']);
        if ($document->is_confidential && !$canViewConf) {
            abort(403);
        }
        return Storage::download($document->path, $document->title);
    }

    public function destroy(Client $client, ClientDocument $document)
    {
        $this->authorize('update', $client);
        abort_if($document->client_id !== $client->id, 404);
        Storage::delete($document->path);
        $document->delete();
        return response()->json(['message' => 'deleted']);
    }
}
