<?php

namespace App\Http\Controllers;

use App\Models\Profil;
use App\Models\Rappel;
use App\Http\Resources\MedicamentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Retourne une vue d'ensemble unifiée (Meds + Planning + Stats) en un seul appel.
     * Caches the result per profile/date for maximum performance.
     */
    public function summary(Request $request)
    {
        $profilId = $request->header('X-Profil-Id');
        if (!$profilId) {
            return response()->json(['message' => 'Profil non spécifié'], 400);
        }

        $date = $request->query('date', Carbon::today()->toDateString());
        $cacheKey = "dashboard_summary_{$profilId}_{$date}";

        return Cache::remember($cacheKey, 300, function () use ($request, $profilId, $date) {
            
            // 1. Récupérer le Profil
            $profil = Profil::where('id', $profilId)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            // 2. Récupérer les Médicaments (Inventaire)
            $medicaments = $profil->medicaments()
                ->with(['rappels'])
                ->orderBy('nom')
                ->get();

            // 3. Récupérer le Planning
            $rappels = Rappel::whereHas('medicament', function($q) use ($profilId) {
                $q->where('profil_id', $profilId);
            })
            ->with(['medicament', 'prises' => function($q) use ($date) {
                $q->where('date_prise', $date);
            }])
            ->get();

            // Formatter le planning (Logique extraite de PlanningController)
            $grouped = [
                'matin' => [], 'midi' => [], 'apres-midi' => [],
                'soir' => [], 'coucher' => [], 'libre' => []
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

            return [
                'user' => [
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ],
                'profil' => $profil->only(['id', 'nom', 'relation']),
                'inventory' => [
                    'items' => MedicamentResource::collection($medicaments),
                    'total' => $medicaments->count()
                ],
                'planning' => [
                    'schedule' => $grouped,
                    'percentage' => $percentage,
                    'stats' => [
                        'total' => $totalCount,
                        'taken' => $takenCount
                    ]
                ]
            ];
        });
    }
}
