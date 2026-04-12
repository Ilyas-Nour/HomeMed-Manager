<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\MedicamentRequest;
use App\Models\SharingMessage;
use App\Events\MessageSent;

class ChatController extends Controller
{
    /**
     * Récupérer les messages d'une demande.
     * Scalabilité : Utilise cursorPaginate pour l'historique des discussions.
     */
    public function index(Request $request, MedicamentRequest $medRequest)
    {
        $user = $request->user();
        
        // Sécurité : Seules les parties prenantes accèdent au chat
        if ($user->id !== $medRequest->requester_id && $user->id !== $medRequest->owner_id) {
            return response()->json(['message' => 'Accès interdit au chat'], 403);
        }

        $messages = $medRequest->messages()
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc') 
            ->cursorPaginate(50);

        return response()->json($messages);
    }

    /**
     * Envoyer un message dans le cadre d'un partage.
     */
    public function store(Request $request, MedicamentRequest $medRequest)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $user = $request->user();
        
        if ($user->id !== $medRequest->requester_id && $user->id !== $medRequest->owner_id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $message = SharingMessage::create([
            'request_id' => $medRequest->id,
            'sender_id' => $user->id,
            'content' => $request->content,
            'is_read' => false
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load('sender:id,name'), 201);
    }

    /**
     * Marquer tous les messages d'une demande comme lus pour l'utilisateur actuel.
     */
    public function markAsRead(Request $request, MedicamentRequest $medRequest)
    {
        $user = $request->user();
        
        if ($user->id !== $medRequest->requester_id && $user->id !== $medRequest->owner_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        SharingMessage::where('request_id', $medRequest->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Messages marqués comme lus']);
    }
}
