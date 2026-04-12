<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Groupe extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'proprietaire_id',
    ];

    public function proprietaire()
    {
        return $this->belongsTo(User::class, 'proprietaire_id');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'groupe_user')->withPivot('role')->withTimestamps();
    }

    /**
     * Invitations envoyées pour ce groupe.
     */
    public function invitations()
    {
        return $this->hasMany(GroupInvitation::class);
    }

    /**
     * Demandes de partage effectuées au sein de ce groupe.
     */
    public function sharingRequests()
    {
        return $this->hasMany(MedicamentRequest::class, 'groupe_id');
    }
}
