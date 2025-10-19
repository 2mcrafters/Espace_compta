<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'path',
        'original_name',
        'size_bytes',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(RequestModel::class, 'request_id');
    }
}
