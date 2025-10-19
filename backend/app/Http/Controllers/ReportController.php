<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\TimeEntry;
use App\Models\UserRate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    // GET /reports/productivity?from=YYYY-MM-DD&to=YYYY-MM-DD
    public function productivity(Request $request)
    {
        $this->authorize('viewReports', Client::class);
        $validated = $request->validate([
            'from' => ['required','date'],
            'to' => ['required','date','after_or_equal:from'],
        ]);

        $from = $validated['from'];
        $to = $validated['to'];

        // Minutes per client
        $perClient = TimeEntry::select('tasks.client_id', DB::raw('SUM(COALESCE(duration_min, TIMESTAMPDIFF(MINUTE, start_at, end_at))) as minutes'))
            ->join('tasks', 'tasks.id', '=', 'time_entries.task_id')
            ->whereBetween('start_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->groupBy('tasks.client_id')
            ->get();

        // Minutes per collaborator (user)
        $perUser = TimeEntry::select('user_id', DB::raw('SUM(COALESCE(duration_min, TIMESTAMPDIFF(MINUTE, start_at, end_at))) as minutes'))
            ->whereBetween('start_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->groupBy('user_id')
            ->get();

        return response()->json([
            'per_client' => $perClient,
            'per_user' => $perUser,
        ]);
    }

    // GET /reports/timesheet?user_id=&from=&to=
    public function timesheet(Request $request)
    {
        $this->authorize('viewReports', Client::class);
        $validated = $request->validate([
            'user_id' => ['nullable','exists:users,id'],
            'from' => ['required','date'],
            'to' => ['required','date','after_or_equal:from'],
        ]);
        $q = TimeEntry::query()->with(['task:id,client_id','user:id,name,email'])
            ->whereBetween('start_at', [$validated['from'].' 00:00:00', $validated['to'].' 23:59:59'])
            ->orderBy('start_at');
        if (!empty($validated['user_id'])) {
            $q->where('user_id', $validated['user_id']);
        }
        $entries = $q->get()->map(function ($e) {
            return [
                'start_at' => optional($e->start_at)->toDateTimeString(),
                'end_at' => optional($e->end_at)->toDateTimeString(),
                'minutes' => $e->duration_min,
                'task_id' => $e->task_id,
                'client_id' => optional($e->task)->client_id,
                'user' => [ 'id' => $e->user->id, 'name' => $e->user->name, 'email' => $e->user->email ],
                'comment' => $e->comment,
            ];
        });
        return response()->json(['entries' => $entries]);
    }

    // GET /reports/client-costs?from=&to=
    // Restricted to users with users.rate.set or ADMIN/CHEF_EQUIPE (via policy/gate)
    public function clientCosts(Request $request)
    {
        $this->authorize('viewReports', Client::class);
        // Enforce additional permission for seeing costs
        abort_unless($request->user()->can('users.rate.set') || $request->user()->hasAnyRole(['ADMIN','CHEF_EQUIPE']), 403);

        $validated = $request->validate([
            'from' => ['required','date'],
            'to' => ['required','date','after_or_equal:from'],
        ]);
        $from = $validated['from'];
        $to = $validated['to'];

        // Compute minutes per user per client, then apply latest user rate <= date range end
        $rows = TimeEntry::select('tasks.client_id','time_entries.user_id', DB::raw('SUM(COALESCE(duration_min, TIMESTAMPDIFF(MINUTE, start_at, end_at))) as minutes'))
            ->join('tasks','tasks.id','=','time_entries.task_id')
            ->whereBetween('start_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->groupBy('tasks.client_id','time_entries.user_id')
            ->get();

        $userRates = UserRate::select('user_id','hourly_rate_mad','effective_from')
            ->orderBy('effective_from','desc')->get()->groupBy('user_id');

        $perClient = [];
        foreach ($rows as $r) {
            $rate = optional($userRates->get($r->user_id))->firstWhere('effective_from', '<=', $to);
            $hourly = $rate->hourly_rate_mad ?? 0;
            $hours = ($r->minutes ?? 0) / 60.0;
            $cost = round($hours * (float) $hourly, 2);
            if (!isset($perClient[$r->client_id])) $perClient[$r->client_id] = ['minutes' => 0, 'cost' => 0.0];
            $perClient[$r->client_id]['minutes'] += (int) $r->minutes;
            $perClient[$r->client_id]['cost'] += $cost;
        }

        // Normalize
        $result = [];
        foreach ($perClient as $clientId => $agg) {
            $result[] = [
                'client_id' => $clientId,
                'minutes' => $agg['minutes'],
                'hours' => round($agg['minutes'] / 60, 2),
                'cost_mad' => round($agg['cost'], 2),
            ];
        }
        return response()->json(['per_client' => $result]);
    }

    // GET /exports/time-excel - stream CSV compatible with Excel
    public function timeExcel(Request $request)
    {
        $this->authorize('exportTime', Client::class);
        // Stream CSV (Excel-compatible). To enable native .xlsx, install maatwebsite/excel and swap to Excel::download.
        $filename = 'time_entries_'.now()->format('Ymd_His').'.csv';
        $response = new StreamedResponse(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['User ID','Task ID','Client ID','Start','End','Minutes','Comment']);
            TimeEntry::select('time_entries.*','tasks.client_id')
                ->join('tasks','tasks.id','=','time_entries.task_id')
                ->orderBy('time_entries.start_at')
                ->chunk(1000, function ($rows) use ($out) {
                    foreach ($rows as $row) {
                        $minutes = $row->duration_min ?? ($row->end_at && $row->start_at ? round(($row->end_at->getTimestamp() - $row->start_at->getTimestamp())/60) : null);
                        fputcsv($out, [
                            $row->user_id,
                            $row->task_id,
                            $row->client_id,
                            optional($row->start_at)->toDateTimeString(),
                            optional($row->end_at)->toDateTimeString(),
                            $minutes,
                            $row->comment,
                        ]);
                    }
                });
            fclose($out);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="'.$filename.'"');

        return $response;
    }
}
