<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modèle Médicament.
 *
 * Représente un médicament appartenant à un profil donné.
 * Contient toutes les métadonnées définies dans le cahier des charges.
 *
 * @property int $id
 * @property int $profil_id
 * @property string $nom
 * @property string $type
 * @property string $posologie
 * @property Carbon $date_debut
 * @property Carbon|null $date_fin
 * @property Carbon|null $date_expiration
 * @property int $quantite
 * @property int $seuil_alerte
 * @property string|null $notes
 */
class Medicament extends Model
{
    use HasFactory;

    /**
     * Nom de la table en base de données.
     */
    protected $table = 'medicaments';

    /**
     * Champs autorisés à l'assignation de masse.
     */
    protected $fillable = [
        'profil_id',
        'nom',
        'type',
        'posologie',
        'date_debut',
        'date_fin',
        'date_expiration',
        'quantite',
        'seuil_alerte',
        'notes',
        'is_public',
    ];

    /**
     * Conversion automatique des types de champs.
     */
    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_expiration' => 'date',
        'quantite' => 'integer',
        'seuil_alerte' => 'integer',
        'is_public' => 'boolean',
    ];

    /**
     * Relation : Un médicament appartient à un profil.
     */
    public function profil(): BelongsTo
    {
        return $this->belongsTo(Profil::class, 'profil_id');
    }

    /**
     * Accesseur : Indique si le stock est faible.
     */
    public function getStockFaibleAttribute(): bool
    {
        return $this->quantite <= $this->seuil_alerte;
    }

    /**
     * Accesseur : Indique si le médicament est expiré.
     */
    public function getExpireAttribute(): bool
    {
        return $this->date_expiration !== null && $this->date_expiration->isPast();
    }

    /**
     * Accesseur : Indique si le traitement est en cours.
     */
    public function getTraitementActifAttribute(): bool
    {
        $now = now();

        return $this->date_debut->lte($now) &&
               ($this->date_fin === null || $this->date_fin->gte($now));
    }

    /**
     * Relation : Un médicament peut avoir plusieurs rappels.
     */
    public function rappels(): HasMany
    {
        return $this->hasMany(Rappel::class, 'medicament_id');
    }

    /**
     * Relation : Un médicament peut avoir plusieurs enregistrements d'achats.
     */
    public function achats(): HasMany
    {
        return $this->hasMany(Achat::class, 'medicament_id');
    }

    /**
     * Relation : Un médicament peut faire l'objet de plusieurs demandes de partage.
     */
    public function requests(): HasMany
    {
        return $this->hasMany(MedicamentRequest::class, 'medicament_id');
    }
}
