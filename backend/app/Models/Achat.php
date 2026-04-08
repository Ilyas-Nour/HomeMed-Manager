<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achat extends Model
{
    use HasFactory;

    const STATUT_PENDING   = 'pending';
    const STATUT_COMPLETED = 'completed';

    protected $fillable = [
        'medicament_id',
        'statut',
        'label',
        'pharmacie',
        'prix',
        'quantite',
        'date_achat',
    ];

    /**
     * Chaque achat correspond à un médicament.
     */
    public function medicament()
    {
        return $this->belongsTo(Medicament::class);
    }
}
