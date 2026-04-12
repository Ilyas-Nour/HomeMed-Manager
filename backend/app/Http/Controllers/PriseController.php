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
            // Eager load everything needed for the check
            $rappel = Rappel::with(['medicament.profil'])->findOrFail($validated['rappel_id']);
            
            // Security : vérifier l'appartenance
            if ($rappel->medicament->profil->user_id !== auth()->id()) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            // Vérifier l'état précédent
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

            // Logic de stock
            if ($validated['pris'] && !$previouslyPris) {
                if ($rappel->medicament->quantite > 0) {
                    $rappel->medicament->decrement('quantite', 1);
                    ActivityLog::log('PRISE_MED', "Dose prise : {$rappel->medicament->nom}");
                }
            } 
            elseif (!$validated['pris'] && $previouslyPris) {
                $rappel->medicament->increment('quantite', 1);
                ActivityLog::log('PRISE_CANCEL', "Prise annulée : {$rappel->medicament->nom}");
            }

            broadcast(new \App\Events\DataChanged('prise', $rappel->medicament->profil_id))->toOthers();

            return response()->json($prise);
        });
    }
}
