<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'push_medications',
        'push_renewals',
        'email_reports',
        'email_alerts',
        'sound'
    ];

    protected $casts = [
        'push_medications' => 'boolean',
        'push_renewals' => 'boolean',
        'email_reports' => 'boolean',
        'email_alerts' => 'boolean',
        'sound' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
