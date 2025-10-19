<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'start_at',
        'end_at',
        'duration_min',
        'comment',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'duration_min' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    protected function durationMin(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value !== null) {
                    return (int) $value;
                }
                $start = $this->start_at;
                $end = $this->end_at;
                if ($start && $end) {
                    return (int) round(($end->getTimestamp() - $start->getTimestamp()) / 60);
                }
                return null;
            },
        );
    }
}
