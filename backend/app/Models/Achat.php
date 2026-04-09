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
        'profil_id',
        'medicament_id',
        'medicament_nom_temp',
        'statut',
        'label',
        'pharmacie',
        'prix',
        'quantite',
        'date_achat',
    ];

    /**
     * Chaque achat appartient à un profil.
     */
    public function profil()
    {
        return $this->belongsTo(Profil::class);
    }

    /**
     * Chaque achat correspond à un médicament.
     */
    public function medicament()
    {
        return $this->belongsTo(Medicament::class);
    }
}
