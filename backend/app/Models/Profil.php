<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modèle Profil.
 *
 * Un utilisateur peut avoir plusieurs profils représentant
 * des membres de sa famille ou lui-même.
 *
 * @property int $id
 * @property int $user_id
 * @property string $nom
 * @property string $relation
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Profil extends Model
{
    use HasFactory;

    /**
     * Nom de la table en base de données.
     */
    protected $table = 'profils';

    /**
     * Champs autorisés à l'assignation de masse.
     */
    protected $fillable = [
        'user_id',
        'nom',
        'relation',
    ];

    /**
     * Relation : Un profil appartient à un utilisateur.
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relation : Un profil possède plusieurs médicaments.
     * La suppression du profil entraîne la suppression des médicaments (cascade définie en DB).
     */
    public function medicaments(): HasMany
    {
        return $this->hasMany(Medicament::class, 'profil_id');
    }
}
