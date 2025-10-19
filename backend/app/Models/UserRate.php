<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hourly_rate_mad',
        'effective_from',
    ];

    protected $casts = [
        'hourly_rate_mad' => 'decimal:2',
        'effective_from' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
