<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequestModel extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'client_id',
        'created_by',
        'task_id',
        'title',
        'status',
        'due_date',
        'period_from',
        'period_to',
        'reminders_count',
        'first_sent_at',
        'responded_at',
        'reminders',
    ];

    protected $casts = [
        'due_date' => 'date',
        'period_from' => 'date',
        'period_to' => 'date',
        'first_sent_at' => 'datetime',
        'responded_at' => 'datetime',
        'reminders' => 'array',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function requestMessages(): HasMany
    {
        return $this->hasMany(RequestMessage::class, 'request_id');
    }

    public function requestFiles(): HasMany
    {
        return $this->hasMany(RequestFile::class, 'request_id');
    }
}
