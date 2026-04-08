<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupInvitation extends Model
{
    protected $fillable = [
        'groupe_id',
        'email',
        'token',
        'role',
        'statut',
        'expires_at'
    ];

    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }
}
