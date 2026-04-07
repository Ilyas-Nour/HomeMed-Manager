<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rappel extends Model
{
    use HasFactory;

    protected $fillable = ['medicament_id', 'moment', 'heure'];

    public function medicament()
    {
        return $this->belongsTo(Medicament::class);
    }

    public function prises()
    {
        return $this->hasMany(Prise::class);
    }
}
