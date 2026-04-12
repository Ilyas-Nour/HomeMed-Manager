<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Groupe;
use App\Models\Medicament;

class SharedPharmacyController extends Controller
{
    /**
     * Liste les médicaments partagés au sein d'un groupe.
     * Scalabilité : Utilise cursorPaginate pour gérer efficacement de grandes listes.
     */
    public function index(Request $request, $groupeId)
    {
        $user = $request->user();
        $groupe = Groupe::findOrFail($groupeId);
        
        // Vérifier l'appartenance au groupe
        $isMember = $groupe->participants()->where('users.id', $user->id)->exists() || $groupe->proprietaire_id === $user->id;
        
        if (!$isMember) {
            return response()->json(['message' => 'Accès refusé au groupe'], 403);
        }

        // Membres du groupe (incluant le propriétaire)
        $memberIds = $groupe->participants->pluck('id')->push($groupe->proprietaire_id)->unique();

        // Médicaments appartenant aux membres du groupe
        $sharedMeds = Medicament::whereHas('profil', function($q) use ($memberIds) {
                $q->whereIn('user_id', $memberIds);
            })
            ->whereHas('profil', function($q) use ($user) {
                $q->where('user_id', '!=', $user->id); // Exclure ses propres médicaments de la "pharmacie partagée"
            })
            ->with(['profil:id,nom,user_id', 'profil.utilisateur:id,name'])
            ->orderBy('nom')
            ->cursorPaginate(20);

        return response()->json($sharedMeds);
    }
}
