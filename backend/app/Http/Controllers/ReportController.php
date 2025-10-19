<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\TimeEntry;
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
