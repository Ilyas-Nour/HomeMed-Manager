<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modèle Utilisateur.
 *
 * Représente un compte utilisateur sur HomeMed Manager.
 * Un utilisateur peut avoir plusieurs profils (soi-même, famille, etc.)
 */
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Vérifier si l'utilisateur peut accéder au panel Filament.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Champs autorisés à l'assignation de masse.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Champs masqués lors de la sérialisation JSON.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Conversion automatique des types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'string',
        ];
    }

    /**
     * Vérifier si l'utilisateur est administrateur.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Relation : Un utilisateur possède plusieurs profils.
     */
    public function profils(): HasMany
    {
        return $this->hasMany(Profil::class, 'user_id');
    }

    /**
     * Relation : Un utilisateur possède plusieurs médicaments à travers ses profils.
     */
    public function medicaments()
    {
        return $this->hasManyThrough(Medicament::class, Profil::class);
    }

    public function ownedGroups(): HasMany
    {
        return $this->hasMany(Groupe::class, 'proprietaire_id');
    }

    /**
     * Relation : Un utilisateur appartient à plusieurs groupes (collaboratifs).
     */
    public function participatedGroups()
    {
        return $this->belongsToMany(Groupe::class, 'groupe_user')->withPivot('role')->withTimestamps();
    }
}
