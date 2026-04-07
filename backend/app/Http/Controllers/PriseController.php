<?php

namespace App\Http\Controllers;

use App\Models\Prise;
use App\Models\Profil;
use App\Models\Rappel;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PriseController extends Controller
{
    /**
     * Timeline des rappels pour aujourd'hui (Profil spécifique).
     * Sécurisé : Vérifie que le profil appartient à l'utilisateur.
     */
    public function index(Profil $profil)
    {
        // Sécurité : Un utilisateur ne peut voir que ses propres profils
        if ($profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Profil non autorisé'], 403);
        }

        $today = Carbon::today()->toDateString();

        // On récupère les rappels avec uniquement les colonnes nécessaires (Vitesse Optimale)
        $rappels = Rappel::select('id', 'medicament_id', 'moment', 'heure')
            ->whereHas('medicament', function ($q) use ($profil) {
                $q->where('profil_id', $profil->id);
            })
            ->with([
                'medicament:id,nom,type,quantite', // Stock sync inclus
                'prises' => function ($q) use ($today) {
                    $q->where('date_prise', $today)->select('id', 'rappel_id', 'pris', 'date_prise');
                },
            ])
            ->get()
            ->map(function ($rappel) {
                $prise = $rappel->prises->first();

                return [
                    'id' => $rappel->id,
                    'medicament_id' => $rappel->medicament_id,
                    'nom' => $rappel->medicament->nom,
                    'type' => $rappel->medicament->type,
                    'stock' => $rappel->medicament->quantite,
                    'moment' => $rappel->moment,
                    'heure' => $rappel->heure,
                    'pris' => $prise ? $prise->pris : false,
                    'prise_id' => $prise ? $prise->id : null,
                ];
            });

        return response()->json($rappels);
    }

    /**
     * Basculer l'état d'une prise (Pris / Non-pris) et mettre à jour le stock.
     * Sécurisé : Vérifie l'ownership du médicament relié au rappel.
     */
    public function toggle(Request $request, Rappel $rappel)
    {
        // Sécurité : Vérifier que le médicament appartient à l'utilisateur (via le profil)
        if ($rappel->medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $today = Carbon::today()->toDateString();
        $prise = Prise::firstOrNew(['rappel_id' => $rappel->id, 'date_prise' => $today]);

        $oldStatus = $prise->exists ? (bool) $prise->pris : false;
        $newStatus = (bool) $request->input('pris', ! $oldStatus);

        $prise->pris = $newStatus;
        $prise->save();

        // Gestion du Stock Automatique (Phase 2 - Requirement 3.5)
        $medicament = $rappel->medicament;
        if ($oldStatus !== $newStatus) {
            if ($newStatus) {
                // Diminuer le stock, mais pas en dessous de 0
                if ($medicament->quantite > 0) {
                    $medicament->decrement('quantite');
                }
            } else {
                // Augmenter le stock si on annule la prise
                $medicament->increment('quantite');
            }
        }

        return response()->json([
            'pris' => $newStatus,
            'quantite' => $medicament->fresh()->quantite,
        ]);
    }
}
