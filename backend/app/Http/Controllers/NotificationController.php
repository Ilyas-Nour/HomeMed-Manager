<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Liste des notifications du profil actif.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $profilId = $request->header('X-Profil-Id');

        $query = Notification::where('user_id', $user->id)
            ->whereDate('created_at', now()->toDateString())
            ->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            });

        $notifications = $query->orderByDesc('created_at')->get();

        return response()->json($notifications);
    }

    /**
     * Marquer une notification comme lue.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Marqué comme lu']);
    }

    /**
     * Marquer toutes les notifications comme lues.
     */
    public function markAllAsRead(Request $request)
    {
        $profilId = $request->header('X-Profil-Id');
        
        Notification::where('user_id', $request->user()->id)
            ->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            })
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Toutes marquées comme lues']);
    }

    /**
     * Supprimer toutes les notifications d'aujourd'hui.
     */
    public function clearAll(Request $request)
    {
        $profilId = $request->header('X-Profil-Id');
        
        Notification::where('user_id', $request->user()->id)
            ->whereDate('created_at', now()->toDateString())
            ->where(function ($q) use ($profilId) {
                $q->whereNull('profil_id')->orWhere('profil_id', $profilId);
            })
            ->delete();

        return response()->json(['message' => 'Toutes les notifications ont été effacées']);
    }

    /**
     * Supprimer une notification.
     */
    public function destroy(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Supprimé']);
    }

    /**
     * Store (for frontend notifications persistence).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'profil_id' => 'nullable|exists:profils,id',
            'type'      => 'required|string',
            'title'     => 'required|string',
            'message'   => 'required|string',
            'data'      => 'nullable|array',
        ]);

        $notification = Notification::create([
            'user_id'   => $request->user()->id,
            'profil_id' => $validated['profil_id'],
            'type'      => $validated['type'],
            'title'     => $validated['title'],
            'message'   => $validated['message'],
            'data'      => $validated['data'],
        ]);

        return response()->json($notification, 201);
    }
}
