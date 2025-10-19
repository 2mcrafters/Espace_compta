<?php

namespace App\Http\Controllers;

use App\Models\RequestModel;
use App\Models\RequestFile;
use App\Models\RequestMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

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
            'period_from' => ['sometimes','date','nullable'],
            'period_to' => ['sometimes','date','nullable'],
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

    // POST /requests/{requestModel}/messages { message_html }
    public function addMessage(Request $request, RequestModel $requestModel)
    {
        $this->authorize('update', $requestModel);
        $data = $request->validate(['message_html' => ['required','string']]);
        $msg = RequestMessage::create([
            'request_id' => $requestModel->id,
            'user_id' => $request->user()->id,
            'message_html' => $data['message_html'],
        ]);
        return response()->json($msg->load('user'), 201);
    }

    // POST /requests/{requestModel}/remind { note }
    public function remind(Request $request, RequestModel $requestModel)
    {
        $this->authorize('update', $requestModel);
        $data = $request->validate(['note' => ['nullable','string','max:500']]);
        $reminders = $requestModel->reminders ?? [];
        $reminders[] = [
            'at' => now()->toISOString(),
            'by' => $request->user()->id,
            'note' => $data['note'] ?? null,
        ];
        $requestModel->update([
            'status' => 'EN_RELANCE',
            'reminders_count' => ($requestModel->reminders_count ?? 0) + 1,
            'reminders' => $reminders,
            'first_sent_at' => $requestModel->first_sent_at ?: now(),
        ]);
        return response()->json(['message' => 'reminded', 'reminders' => $reminders]);
    }

    // GET /requests/metrics?from=&to=
    public function metrics(Request $request)
    {
        $this->authorize('viewAny', RequestModel::class);
        $validated = $request->validate([
            'from' => ['nullable','date'],
            'to' => ['nullable','date','after_or_equal:from'],
        ]);
        $q = RequestModel::query();
        if (!empty($validated['from'])) $q->whereDate('created_at', '>=', $validated['from']);
        if (!empty($validated['to'])) $q->whereDate('created_at', '<=', $validated['to']);
        $total = (clone $q)->count();
    $byStatus = (clone $q)->select('status', DB::raw('COUNT(*) as c'))->groupBy('status')->pluck('c','status');
        $responded = (clone $q)->whereNotNull('responded_at')->count();
        // avg delay: responded_at - first_sent_at for responded ones
        $avgDelayMin = (clone $q)
            ->whereNotNull('responded_at')->whereNotNull('first_sent_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, first_sent_at, responded_at)) as avgm')
            ->value('avgm');
        $completeness = (clone $q)->where('status','VALIDE')->count() / max($total,1);
        return response()->json([
            'total' => $total,
            'by_status' => $byStatus,
            'responded' => $responded,
            'avg_response_minutes' => $avgDelayMin ? (int) round($avgDelayMin) : null,
            'completeness_ratio' => round($completeness, 3),
        ]);
    }
}
