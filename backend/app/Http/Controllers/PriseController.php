<?php

namespace App\Http\Controllers;

use App\Models\Prise;
use App\Models\Rappel;
use App\Models\Profil;
use App\Models\Medicament;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PriseController extends Controller
{
    /**
     * Timeline des rappels pour aujourd'hui (Profil spécifique).
     */
    public function index(Profil $profil)
    {
        $today = Carbon::today()->toDateString();
        
        // On récupère tous les rappels des médicaments de ce profil avec chargement optimisé
        $rappels = Rappel::whereHas('medicament', function($q) use ($profil) {
            $q->where('profil_id', $profil->id);
        })
        ->with([
            'medicament:id,nom,type', 
            'prises' => function($q) use ($today) {
                $q->where('date_prise', $today)->select('id', 'rappel_id', 'pris', 'date_prise');
            }
        ])
        ->get()
        ->map(function ($rappel) {
            $prise = $rappel->prises->first();
            return [
                'id'            => $rappel->id,
                'medicament_id' => $rappel->medicament_id,
                'nom'           => $rappel->medicament->nom,
                'type'          => $rappel->medicament->type,
                'moment'        => $rappel->moment,
                'heure'         => $rappel->heure,
                'pris'          => $prise ? $prise->pris : false,
                'prise_id'      => $prise ? $prise->id : null,
            ];
        });

        return response()->json($rappels);
    }

    /**
     * Basculer l'état d'une prise (Pris / Non-pris) et mettre à jour le stock.
     */
    public function toggle(Request $request, Rappel $rappel)
    {
        $today = Carbon::today()->toDateString();
        $prise = Prise::firstOrNew(['rappel_id' => $rappel->id, 'date_prise' => $today]);
        
        $oldStatus = $prise->exists ? $prise->pris : false;
        $newStatus = $request->input('pris', !$oldStatus);

        $prise->pris = $newStatus;
        $prise->save();

        // Gestion du Stock Automatique (Phase 2)
        $medicament = $rappel->medicament;
        if ($oldStatus !== $newStatus) {
            if ($newStatus) {
                $medicament->decrement('quantite');
                \App\Models\ActivityLog::log('PRISE_CHECK', "Prise validée : {$medicament->nom}");
            } else {
                $medicament->increment('quantite');
                \App\Models\ActivityLog::log('PRISE_CANCEL', "Prise annulée : {$medicament->nom}");
            }
        }

        return response()->json([
            'pris'     => $newStatus,
            'quantite' => $medicament->quantite
        ]);
    }
}
