<?php

namespace App\Http\Controllers;

use App\Models\RequestModel;
use App\Models\RequestFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RequestController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', RequestModel::class);
        return response()->json(
            RequestModel::with('client')->latest()->paginate(20)
        );
    }

    public function show(RequestModel $requestModel)
    {
        $this->authorize('view', $requestModel);
        return response()->json($requestModel->load(['client','requestFiles','requestMessages']));
    }

    public function store(Request $request)
    {
        $this->authorize('create', RequestModel::class);
        $data = $request->validate([
            'client_id' => ['required','exists:clients,id'],
            'title' => ['required','string','max:255'],
            'status' => ['nullable','in:EN_ATTENTE,EN_RELANCE,RECU,INCOMPLET,VALIDE'],
            'due_date' => ['nullable','date'],
        ]);
        $data['created_by'] = $request->user()->id;
        $model = RequestModel::create($data);
        return response()->json($model, 201);
    }

    public function update(Request $request, RequestModel $requestModel)
    {
        $this->authorize('update', $requestModel);
        $data = $request->validate([
            'title' => ['sometimes','string','max:255'],
            'status' => ['sometimes','in:EN_ATTENTE,EN_RELANCE,RECU,INCOMPLET,VALIDE'],
            'due_date' => ['sometimes','date','nullable'],
        ]);
        $requestModel->update($data);
        return response()->json($requestModel);
    }

    public function destroy(RequestModel $requestModel)
    {
        $this->authorize('delete', $requestModel);
        $requestModel->delete();
        return response()->json(['message' => 'deleted']);
    }

    // POST /requests/{id}/files (multipart/form-data: file)
    public function storeFile(Request $request, RequestModel $requestModel)
    {
        $this->authorize('update', $requestModel);
        $request->validate([
            'file' => [
                'required',
                'file',
                // up to ~25MB
                'max:25600',
                // allow common office/image/pdf/zip/plain
                'mimetypes:application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip'
            ],
        ]);

        $uploaded = $request->file('file');
        $path = $uploaded->store('requests/'.$requestModel->id, 'public');
        $file = RequestFile::create([
            'request_id' => $requestModel->id,
            'path' => $path,
            'original_name' => $uploaded->getClientOriginalName(),
            'size_bytes' => $uploaded->getSize(),
        ]);

        return response()->json([
            'id' => $file->id,
            'request_id' => $file->request_id,
            'url' => asset('storage/'.$file->path),
            'path' => $file->path,
            'original_name' => $file->original_name,
            'size_bytes' => $file->size_bytes,
            'mime_type' => $uploaded->getMimeType(),
            'created_at' => optional($file->created_at)->toISOString(),
        ], 201);
    }

    // DELETE /requests/{id}/files/{file}
    public function deleteFile(RequestModel $requestModel, RequestFile $file)
    {
        $this->authorize('update', $requestModel);
        if ($file->request_id !== $requestModel->id) {
            abort(404);
        }
        Storage::disk('public')->delete($file->path);
        $file->delete();
        return response()->json(['message' => 'deleted']);
    }
}
