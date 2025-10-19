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
        'adresse',
        'forme_juridique',
        'statut_juridique',
        'date_creation',
        'capital_social',
        'associes',
        'regime_fiscal',
        'date_debut_collaboration',
        'responsable_client',
        'telephone',
        'email',
        'type_mission',
        'montant_contrat',
    ];

    protected $casts = [
        'date_creation' => 'date',
        'date_debut_collaboration' => 'date',
        'capital_social' => 'decimal:2',
        'montant_contrat' => 'decimal:2',
        'associes' => 'array',
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

    public function collaborators()
    {
        return $this->belongsToMany(User::class, 'client_user')->withTimestamps();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ClientDocument::class);
    }
}
