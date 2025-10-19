<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'portfolio_id',
        'raison_sociale',
        'rc',
        'if',
        'ice',
        'forme_juridique',
        'date_creation',
        'capital_social',
        'responsable_client',
        'telephone',
        'email',
        'type_mission',
        'montant_contrat',
    ];

    protected $casts = [
        'date_creation' => 'date',
        'capital_social' => 'decimal:2',
        'montant_contrat' => 'decimal:2',
    ];

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(RequestModel::class, 'client_id');
    }
}
