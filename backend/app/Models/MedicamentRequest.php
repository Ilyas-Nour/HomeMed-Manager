<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicamentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'owner_id',
        'medicament_id',
        'groupe_id',
        'status',
        'notes',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function medicament()
    {
        return $this->belongsTo(Medicament::class, 'medicament_id');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class, 'groupe_id');
    }

    public function messages()
    {
        return $this->hasMany(SharingMessage::class, 'request_id');
    }
}
