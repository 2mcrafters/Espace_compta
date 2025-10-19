<?php

// Provide stub interfaces when maatwebsite/excel is not installed to avoid type resolution errors.
namespace Maatwebsite\Excel\Concerns {
    if (!interface_exists(FromCollection::class)) {
        interface FromCollection {}
    }
    if (!interface_exists(WithHeadings::class)) {
        interface WithHeadings {}
    }
    if (!interface_exists(WithMapping::class)) {
        interface WithMapping {}
    }
}

namespace App\Exports {
    use App\Models\TimeEntry;
    use Illuminate\Support\Collection;

    class TimeEntriesExport implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithMapping
    {
        public function collection(): Collection
        {
            return TimeEntry::select('time_entries.*','tasks.client_id','users.name as user_name','tasks.id as task_id','clients.raison_sociale as client_name')
                ->join('tasks','tasks.id','=','time_entries.task_id')
                ->join('users','users.id','=','time_entries.user_id')
                ->leftJoin('clients','clients.id','=','tasks.client_id')
                ->orderBy('time_entries.start_at')
                ->get();
        }

        public function headings(): array
        {
            return [
                'User',
                'Task',
                'Client',
                'Client Name',
                'Start',
                'End',
                'Minutes',
                'Comment',
            ];
        }

        public function map($row): array
        {
            // Ensure Carbon instances for date calculations
            $start = $row->start_at instanceof \Carbon\Carbon ? $row->start_at : ($row->start_at ? \Carbon\Carbon::parse($row->start_at) : null);
            $end = $row->end_at instanceof \Carbon\Carbon ? $row->end_at : ($row->end_at ? \Carbon\Carbon::parse($row->end_at) : null);
            $minutes = is_numeric($row->duration_min)
                ? (int) $row->duration_min
                : (($start && $end) ? (int) round(($end->getTimestamp() - $start->getTimestamp()) / 60) : null);
            return [
                $row->user_name,
                $row->task_id,
                $row->client_id,
                $row->client_name,
                $start?->toDateTimeString(),
                $end?->toDateTimeString(),
                $minutes,
                $row->comment,
            ];
        }
    }
}
