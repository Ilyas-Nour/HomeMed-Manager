<?php

namespace App\Http\Controllers;

use App\Http\Requests\AchatRequest;
use App\Models\Achat;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AchatController extends Controller
{
    /**
     * Liste des achats pour un médicament (sécurisée par ownership).
     */
    public function index(Request $request)
    {
        $medicamentId = $request->query('medicament_id');

        if ($medicamentId) {
            // Liste des achats pour un médicament spécifique
            $medicament = auth()->user()->medicaments()->findOrFail($medicamentId);
            $achats = $medicament->achats()
                ->orderByDesc('date_achat')
                ->get();
        } else {
            // Liste globale des achats de l'utilisateur
            $medicamentIds = auth()->user()->medicaments()->pluck('medicaments.id');
            $achats = Achat::whereIn('medicament_id', $medicamentIds)
                ->with('medicament')
                ->orderByDesc('date_achat')
                ->get();
        }

        return response()->json($achats);
    }

    /**
     * Enregistrer un nouvel achat et mettre à jour le stock (sécurisé).
     */
    public function store(AchatRequest $request)
    {
        $validated = $request->validated();

        // Sécurité : Vérifier que le médicament appartient à l'utilisateur
        $medicament = auth()->user()->medicaments()->findOrFail($validated['medicament_id']);

        return DB::transaction(function () use ($validated, $medicament) {
            $achat = Achat::create($validated);

            ActivityLog::log('ACHAT_ADD', "Achat enregistré : {$validated['quantite']} unités pour {$medicament->nom}");

            return response()->json([
                'message' => 'Achat enregistré et stock mis à jour',
                'achat' => $achat,
                'nouveau_stock' => $medicament->fresh()->quantite,
            ], 201);
        });
    }

    /**
     * Supprimer un enregistrement d'achat (sécurisé par ownership).
     */
    public function destroy(Achat $achat)
    {
        // Vérification de l'ownership via la relation médicament -> profil
        if ($achat->medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        return DB::transaction(function () use ($achat) {
            $medicament = $achat->medicament;

            // Inverser l'incrémentation du stock (Data Integrity Sweep)
            if ($medicament->quantite >= $achat->quantite) {
                $medicament->decrement('quantite', $achat->quantite);
            } else {
                $medicament->update(['quantite' => 0]);
            }

            $nomMed = $medicament->nom;
            $quantite = $achat->quantite;

            $achat->delete();

            ActivityLog::log('ACHAT_DELETE', "Achat supprimé : -{$quantite} unités pour {$nomMed} (Correction de stock)");

            return response()->json(['message' => 'Achat supprimé et stock rectifié'], 200);
        });
    }
}
