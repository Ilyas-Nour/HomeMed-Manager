<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MedicamentRequest;
use App\Models\SharingMessage;

class NotificationController extends Controller
{
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
}
