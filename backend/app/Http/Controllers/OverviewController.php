<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientDocument;
use App\Models\Portfolio;
use App\Models\Task;
use Illuminate\Support\Carbon;

class OverviewController extends Controller
{
    public function index()
    {
        $clients = Client::count();
        $portfolios = Portfolio::count();
        $docs = ClientDocument::count();
        $recentDocs = ClientDocument::latest()->limit(10)->get(['id','client_id','title','category','created_at']);
        $recentClients = Client::latest()->limit(10)->get(['id','raison_sociale','created_at']);
        return response()->json([
            'counts' => compact('clients','portfolios','docs'),
            'recent_docs' => $recentDocs,
            'recent_clients' => $recentClients,
            'tasks_status' => [
                'EN_ATTENTE' => Task::where('status','EN_ATTENTE')->count(),
                'EN_COURS' => Task::where('status','EN_COURS')->count(),
                'EN_VALIDATION' => Task::where('status','EN_VALIDATION')->count(),
                'TERMINEE' => Task::where('status','TERMINEE')->count(),
            ],
            'overdue' => Task::whereIn('status',['EN_ATTENTE','EN_COURS','EN_VALIDATION'])
                ->whereNotNull('due_at')->where('due_at','<', now())->count(),
        ]);
    }
}
