<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\MedicamentRequest;
use App\Models\SharingMessage;
use App\Models\Rappel;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Liste des notifications pour l'utilisateur et le profil actif.
     */
    public function index(Request $request)
    {
        $profilId = $request->header('X-Profil-Id');
        
        $query = Notification::where('user_id', $request->user()->id)
            ->where('created_at', '>=', now()->subHours(24));

        if ($profilId) {
            $query->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            });
        }

        $notifications = $query->orderByDesc('created_at')->get();

        return response()->json($notifications);
    }

    /**
     * Enregistrer une nouvelle notification (ex: rappel temps réel).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'profil_id' => 'nullable|exists:profils,id',
            'type' => 'required|string',
            'title' => 'required|string',
            'message' => 'required|string',
            'data' => 'nullable|array|json', // Use data if it's already an array or handle string
        ]);

        // Fix for data handling if it arrives as a string
        $data = $request->input('data');
        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        $notification = Notification::create([
            'user_id' => $request->user()->id,
            'profil_id' => $validated['profil_id'],
            'type' => $validated['type'],
            'title' => $validated['title'],
            'message' => $validated['message'],
            'data' => $data,
        ]);

        return response()->json($notification, 201);
    }

    /**
     * Marquer une notification comme lue.
     * Gère aussi les IDs virtuels (v-rappel-date).
     */
    public function markAsRead(Request $request, $id)
    {
        // 1. Cas d'un ID virtuel (généré par le Dashboard pour les doses oubliées)
        if (str_starts_with($id, 'v-')) {
            return $this->handleVirtualMarkAsRead($request, $id);
        }

        // 2. Cas d'une notification réelle en DB
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * Marquer TOUTES les notifications comme lues.
     */
    public function markAllAsRead(Request $request)
    {
        $profilId = $request->header('X-Profil-Id');

        $query = Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at');

        if ($profilId) {
            $query->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            });
        }

        $query->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications sont marquées comme lues']);
    }

    /**
     * Supprimer une notification spécifique.
     */
    public function destroy(Request $request, $id)
    {
        if (str_starts_with($id, 'v-')) {
            return $this->handleVirtualMarkAsRead($request, $id);
        }

        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notification supprimée']);
    }

    /**
     * Tout vider (supprimer).
     */
    public function clearAll(Request $request)
    {
        $profilId = $request->header('X-Profil-Id');

        $query = Notification::where('user_id', $request->user()->id);

        if ($profilId) {
            $query->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            });
        }

        $query->delete();

        return response()->json(['message' => 'Toutes les notifications sont supprimées']);
    }

    /**
     * Retourne uniquement le compteur de collaboration non lu (léger).
     */
    public function collaborationCount(Request $request)
    {
        $user = $request->user();

        $pendingRequestsCount = MedicamentRequest::where('owner_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $unreadMessagesCount = SharingMessage::where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->whereHas('request', function ($q) use ($user) {
                $q->where('owner_id', $user->id)
                  ->orWhere('requester_id', $user->id);
            })
            ->count();

        return response()->json([
            'count' => $pendingRequestsCount + $unreadMessagesCount
        ]);
    }

    /**
     * Persiste une notification virtuelle comme étant "lue" ou "traitée" en DB.
     * Format ID: v-{rappel_id}-{YYYYMMDD}
     */
    private function handleVirtualMarkAsRead(Request $request, $id)
    {
        $parts = explode('-', $id);
        if (count($parts) < 3) {
            return response()->json(['message' => 'ID virtuel invalide'], 400);
        }

        $rappelId = $parts[1];
        $rappel = Rappel::with('medicament')->findOrFail($rappelId);
        $profilId = $request->header('X-Profil-Id');

        // On crée une vraie notification en DB avec read_at = now()
        // Cela permet au DashboardController de l'exclure du scan dynamique (via data.id)
        $notification = Notification::create([
            'user_id' => $request->user()->id,
            'profil_id' => $profilId,
            'type' => 'reminder',
            'title' => "Dose oubliée",
            'message' => "Vous avez oublié de prendre {$rappel->medicament->nom} ({$rappel->heure})",
            'data' => [
                'id' => (int)$rappelId,
                'heure' => $rappel->heure,
                'medicament' => $rappel->medicament->nom,
                'status' => 'missed'
            ],
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Notification virtuelle persistée comme lue',
            'notification' => $notification
        ]);
    }
}
