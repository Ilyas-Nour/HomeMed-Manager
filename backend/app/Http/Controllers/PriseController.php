<?php

namespace App\Http\Controllers;

use App\Models\Prise;
use App\Models\Rappel;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PriseController extends Controller
{
    /**
     * Enregistre ou annule une prise de médicament.
     * Gère automatiquement le décompte du stock.
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'rappel_id' => 'required|exists:rappels,id',
            'date_prise' => 'required|date',
            'pris' => 'required|boolean'
        ]);

        return DB::transaction(function () use ($validated) {
            $rappel = Rappel::with('medicament')->findOrFail($validated['rappel_id']);
            
            // Sécurité : vérifier l'appartenance via le profil
            if ($rappel->medicament->profil->user_id !== auth()->id()) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            // Vérifier l'état précédent pour la logique de stock
            $existingPrise = Prise::where('rappel_id', $validated['rappel_id'])
                ->where('date_prise', $validated['date_prise'])
                ->first();

            $previouslyPris = $existingPrise ? (bool)$existingPrise->pris : false;

            $prise = Prise::updateOrCreate(
                [
                    'rappel_id' => $validated['rappel_id'],
                    'date_prise' => $validated['date_prise']
                ],
                [
                    'pris' => $validated['pris']
                ]
            );

            // 1. Passage de "Non pris" à "Pris" -> Décrémenter stock
            if ($validated['pris'] && !$previouslyPris) {
                if ($rappel->medicament->quantite > 0) {
                    $rappel->medicament->decrement('quantite', 1);
                    ActivityLog::log('PRISE_MED', "Dose prise confirmée : {$rappel->medicament->nom}");
                }
            } 
            // 2. Passage de "Pris" à "Non pris" -> Rectifier stock (incrémenter)
            elseif (!$validated['pris'] && $previouslyPris) {
                $rappel->medicament->increment('quantite', 1);
                ActivityLog::log('PRISE_CANCEL', "Prise annulée : {$rappel->medicament->nom} (stock restauré)");
            }

            return response()->json($prise);
        });
    }
}
