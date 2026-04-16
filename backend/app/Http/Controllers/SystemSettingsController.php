<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SystemSettingsController extends Controller
{
    /**
     * Get public application settings.
     */
    public function index()
    {
        return response()->json([
            'app_name'      => Setting::get('app_name', 'HomeMed Manager'),
            'support_email' => Setting::get('support_email'),
            'support_phone' => Setting::get('support_phone'),
            'ai_enabled'    => Setting::get('ai_enabled', true),
            'registration_enabled' => Setting::get('registration_enabled', true),
        ]);
    }
}
