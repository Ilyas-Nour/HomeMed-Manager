<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SharingMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'sender_id',
        'content',
        'is_read',
    ];

    public function request()
    {
        return $this->belongsTo(MedicamentRequest::class, 'request_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
