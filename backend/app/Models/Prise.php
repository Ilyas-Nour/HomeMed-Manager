<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prise extends Model
{
    use HasFactory;

    protected $fillable = ['rappel_id', 'date_prise', 'pris'];

    protected $casts = [
        'pris' => 'boolean',
    ];

    public function rappel()
    {
        return $this->belongsTo(Rappel::class);
    }
}
