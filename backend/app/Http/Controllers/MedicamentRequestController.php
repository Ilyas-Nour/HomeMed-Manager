<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Medicament;
use App\Models\MedicamentRequest;
use App\Models\Groupe;
use App\Events\RequestUpdated;

class MedicamentRequestController extends Controller
{
    /**
     * Lister les demandes de l'utilisateur (In-app Dashboard).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $requests = MedicamentRequest::where(function($q) use ($user) {
                $q->where('requester_id', $user->id)
                  ->orWhere('owner_id', $user->id);
            })
            ->with(['medicament', 'requester:id,name', 'owner:id,name', 'groupe:id,nom'])
            ->latest()
            ->cursorPaginate(15);

        return response()->json($requests);
    }

    /**
     * Créer une nouvelle demande de médicament.
     */
    public function store(Request $request)
    {
        $request->validate([
            'medicament_id' => 'required|exists:medicaments,id',
            'groupe_id' => 'required|exists:groupes,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $medicament = Medicament::findOrFail($request->medicament_id);
        $user = $request->user();

        $groupe = Groupe::findOrFail($request->groupe_id);
        $isMember = $groupe->participants()->where('users.id', $user->id)->exists() || $groupe->proprietaire_id === $user->id;
        
        if (!$isMember) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $medRequest = MedicamentRequest::create([
            'requester_id' => $user->id,
            'owner_id' => $medicament->profil->user_id,
            'medicament_id' => $medicament->id,
            'groupe_id' => $groupe->id,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        broadcast(new RequestUpdated($medRequest))->toOthers();

        return response()->json($medRequest, 201);
    }

    /**
     * Voir les détails d'une demande spécifique (Chat context).
     */
    public function show(MedicamentRequest $medRequest)
    {
        $user = auth()->user();
        if ($user->id !== $medRequest->requester_id && $user->id !== $medRequest->owner_id) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        return response()->json($medRequest->load(['medicament', 'requester:id,name', 'owner:id,name', 'groupe:id,nom']));
    }

    /**
     * Mettre à jour le statut (Accepter/Refuser/Compléter).
     */
    public function update(Request $request, MedicamentRequest $medRequest)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected,completed',
        ]);

        $user = $request->user();

        // Seul le propriétaire peut accepter ou rejeter
        if (in_array($request->status, ['accepted', 'rejected']) && $user->id !== $medRequest->owner_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Les deux peuvent clore si c'est complété
        if ($request->status === 'completed' && ($user->id !== $medRequest->owner_id && $user->id !== $medRequest->requester_id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $medRequest->update(['status' => $request->status]);

        broadcast(new RequestUpdated($medRequest))->toOthers();

        return response()->json($medRequest);
    }
}
