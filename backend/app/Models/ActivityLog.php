<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'action', 'description', 'metadata'];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper statique pour enregistrer une activité.
     */
    public static function log($action, $description = null, $metadata = null)
    {
        return self::create([
            'user_id'     => auth()->id(),
            'action'      => $action,
            'description' => $description,
            'metadata'    => $metadata,
        ]);
    }
}
