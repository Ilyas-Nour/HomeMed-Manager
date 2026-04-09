<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Medicament;
use App\Models\Rappel;
use Illuminate\Http\Request;

class RappelController extends Controller
{
    /**
     * Liste des rappels pour un médicament spécifique.
     * Sécurisé : Vérifie que le médicament appartient à l'utilisateur.
     */
    public function index(Medicament $medicament)
    {
        if ($medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return response()->json($medicament->rappels()->orderBy('heure')->get());
    }

    /**
     * Création d'un nouveau rappel.
     * Sécurisé : Vérifie l'ownership du médicament.
     */
    public function store(Request $request, Medicament $medicament)
    {
        if ($medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'moment' => 'required|string',
            'heure' => 'required|regex:/^\d{2}:\d{2}(:\d{2})?$/',
        ]);

        $rappel = $medicament->rappels()->create($validated);

        \Illuminate\Support\Facades\Cache::forget("dashboard_summary_{$medicament->profil_id}_" . now()->toDateString());

        ActivityLog::log('RAPPEL_ADD', "Rappel ajouté pour {$medicament->nom} ({$rappel->moment} à {$rappel->heure})");

        return response()->json($rappel, 201);
    }

    /**
     * Mise à jour d'un rappel existant.
     */
    public function update(Request $request, Medicament $medicament, Rappel $rappel)
    {
        if ($rappel->medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'moment' => 'required|string',
            'heure' => 'required|regex:/^\d{2}:\d{2}(:\d{2})?$/',
        ]);

        $rappel->update($validated);

        \Illuminate\Support\Facades\Cache::forget("dashboard_summary_{$rappel->medicament->profil_id}_" . now()->toDateString());

        return response()->json($rappel);
    }

    /**
     * Suppression d'un rappel.
     * Sécurisé : Vérifie l'ownership du rappel via son médicament.
     */
    public function destroy(Rappel $rappel)
    {
        if ($rappel->medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $profilId = $rappel->medicament->profil_id;

        $nomMed = $rappel->medicament->nom;
        $moment = $rappel->moment;

        $rappel->delete();

        \Illuminate\Support\Facades\Cache::forget("dashboard_summary_{$profilId}_" . now()->toDateString());

        ActivityLog::log('RAPPEL_DELETE', "Rappel supprimé pour {$nomMed} ({$moment})");

        return response()->json(null, 204);
    }
}
