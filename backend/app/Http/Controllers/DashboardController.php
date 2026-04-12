<?php

namespace App\Http\Controllers;

use App\Models\Profil;
use App\Models\Rappel;
use App\Models\MedicamentRequest;
use App\Models\SharingMessage;
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
        
        // 1. Récupérer le Profil
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // 2. Récupérer les Médicaments (Inventaire) avec Eager Loading optimisé
        $medicaments = $profil->medicaments()
            ->orderBy('nom')
            ->get();

        $medicamentIds = $medicaments->pluck('id');

        // 3. Récupérer le Planning de manière performante via whereIn
        $rappels = Rappel::whereIn('medicament_id', $medicamentIds)
            ->with(['medicament', 'prises' => function($q) use ($date) {
                $q->where('date_prise', $date);
            }])
            ->get();

        // Formatter le planning
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

        // 4. Récupérer les Notifications récentes (Aujourd'hui) pour ce profil
        $notifications = \App\Models\Notification::where('user_id', $request->user()->id)
            ->whereDate('created_at', now()->toDateString())
            ->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            })
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // 5. Compteur de collaboration (Demandes en attente + Messages non lus)
        $pendingRequestsCount = MedicamentRequest::where('owner_id', $request->user()->id)
            ->where('status', 'pending')
            ->count();

        $unreadMessagesCount = SharingMessage::where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->whereHas('request', function ($q) use ($request) {
                $q->where('owner_id', $request->user()->id)
                  ->orWhere('requester_id', $request->user()->id);
            })
            ->count();

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
            ],
            'notifications' => $notifications,
            'collaboration_unread_count' => $pendingRequestsCount + $unreadMessagesCount,
        ];
    }
}
