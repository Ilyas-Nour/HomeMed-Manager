<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achat extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicament_id',
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
