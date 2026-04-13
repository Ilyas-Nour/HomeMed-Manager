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

        // 6. Récupérer les Notifications existantes
        $dbNotifications = \App\Models\Notification::where('user_id', $request->user()->id)
            ->where('created_at', '>=', now()->subHours(24))
            ->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            })
            ->orderByDesc('created_at')
            ->get();

        // 🔥 7. Génération Dynamique des alertes pour les doses oubliées
        $now = now();
        $dynamicNotifications = [];
        $nowMinutes = ($now->hour * 60) + $now->minute;

        foreach ($rappels as $rappel) {
            $prise = $rappel->prises->first();
            if (!$prise || !$prise->pris) {
                $parts = explode(':', $rappel->heure);
                $prevueMinutes = ($parts[0] * 60) + $parts[1];

                // Si l'heure est passée (marge 2min)
                if ($nowMinutes > ($prevueMinutes + 2)) {
                    // On vérifie si une notification existe déjà en DB pour éviter les doublons visuels
                    $alreadyNotified = $dbNotifications->contains(function($n) use ($rappel) {
                        return isset($n->data['id']) && $n->data['id'] == $rappel->id;
                    });

                    if (!$alreadyNotified) {
                        $dynamicNotifications[] = [
                            'id' => "v-" . $rappel->id . "-" . date('Ymd'),
                            'type' => 'reminder',
                            'title' => "Dose oubliée",
                            'message' => "Vous avez oublié de prendre {$rappel->medicament->nom} ({$rappel->heure})",
                            'data' => [
                                'id' => $rappel->id,
                                'heure' => $rappel->heure,
                                'medicament' => $rappel->medicament->nom,
                                'status' => 'missed'
                            ],
                            'read_at' => null,
                            'created_at' => now()->toIso8601String()
                        ];
                    }
                }
            }
        }

        // Fusionner les notifications réelles et dynamiques
        $allNotifications = collect($dynamicNotifications)->concat($dbNotifications)->sortByDesc('created_at')->values();

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
            'notifications' => $allNotifications,
            'collaboration_unread_count' => $pendingRequestsCount + $unreadMessagesCount,
        ];
    }
}
