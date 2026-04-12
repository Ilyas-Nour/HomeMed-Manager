<?php

namespace App\Http\Controllers;

use App\Models\Rappel;
use App\Models\Prise;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PlanningController extends Controller
{
    /**
     * Récupère le planning du jour et le pourcentage d'observance pour le profil actif.
     */
    public function index(Request $request)
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        $profilId = $request->header('X-Profil-Id');

        if (!$profilId) {
            return response()->json(['message' => 'Profil non spécifié'], 400);
        }

        $rappels = Rappel::whereHas('medicament', function($q) use ($profilId) {
            $q->where('profil_id', $profilId);
        })
        ->with(['medicament', 'prises' => function($q) use ($date) {
            $q->where('date_prise', $date);
        }])
        ->get();

        // On formate pour le frontend
        $grouped = [
            'matin' => [],
            'midi' => [],
            'apres-midi' => [],
            'soir' => [],
            'coucher' => [],
            'libre' => []
        ];

        $takenCount = 0;
        $totalCount = $rappels->count();

        foreach ($rappels as $rappel) {
            $moment = $rappel->moment ?? 'libre';
            $prise = $rappel->prises->first();
            $isPris = $prise ? (bool)$prise->pris : false;

            if ($isPris) $takenCount++;
            
            $grouped[$moment][] = [
                'id' => $rappel->id,
                'medicament' => $rappel->medicament->nom,
                'medicament_id' => $rappel->medicament_id,
                'heure' => $rappel->heure,
                'pris' => $isPris,
                'prise_id' => $prise ? $prise->id : null
            ];
        }

        $percentage = $totalCount > 0 ? round(($takenCount / $totalCount) * 100) : 0;

        return response()->json([
            'schedule' => $grouped,
            'percentage' => $percentage,
            'stats' => [
                'total' => $totalCount,
                'taken' => $takenCount
            ]
        ]);
    }

    /**
     * Retourne les rappels qui doivent être pris maintenant ou prochainement.
     * Version légère pour les notifications/polling.
     */
    public function due(Request $request)
    {
        $profilId = $request->header('X-Profil-Id');
        if (!$profilId) {
            return response()->json(['message' => 'Profil non spécifié'], 400);
        }

        $today = now()->toDateString();
        $currentTime = now()->format('H:i');

        $rappels = Rappel::whereHas('medicament', function($q) use ($profilId) {
            $q->where('profil_id', $profilId);
        })
        ->with(['medicament', 'prises' => function($q) use ($today) {
            $q->where('date_prise', $today);
        }])
        ->get();

        $due = $rappels->filter(function($r) use ($currentTime) {
            // Un rappel est "dû" s'il n'est pas pris et que l'heure est passée
            return !$r->prises->first()?->pris && $r->heure <= $currentTime;
        })->map(function($r) {
            return [
                'id' => $r->id,
                'medicament' => $r->medicament->nom,
                'heure' => $r->heure,
                'moment' => $r->moment
            ];
        });

        return response()->json($due->values());
    }
}
