<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    /**
     * Récupérer les préférences de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        $prefs = NotificationPreference::firstOrCreate(
            ['user_id' => $request->user()->id]
        );

        return response()->json($prefs);
    }

    /**
     * Mettre à jour les préférences.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'push_medications' => 'boolean',
            'push_renewals' => 'boolean',
            'email_reports' => 'boolean',
            'email_alerts' => 'boolean',
            'sound' => 'boolean',
        ]);

        $prefs = NotificationPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($prefs);
    }
}
