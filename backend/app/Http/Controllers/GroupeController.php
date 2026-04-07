<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Groupe;
use App\Models\User;
use Illuminate\Http\Request;

class GroupeController extends Controller
{
    /**
     * Liste des groupes de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        return response()->json($request->user()->participatedGroups()->with('participants:id,name,email')->get());
    }

    /**
     * Création d'un groupe.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
        ]);

        $groupe = Groupe::create([
            'nom' => $validated['nom'],
            'proprietaire_id' => $request->user()->id,
        ]);

        // Attacher le propriétaire en tant que rôle 'proprietaire'
        $groupe->participants()->attach($request->user()->id, ['role' => 'proprietaire']);

        ActivityLog::log('GROUP_ADD', "Groupe créé : {$groupe->nom}");

        return response()->json($groupe->load('participants:id,name,email'), 201);
    }

    /**
     * Afficher un groupe et ses profils partagés.
     * Logique: on retourne tous les profils des membres du groupe.
     */
    public function show(Request $request, $id)
    {
        $groupe = $request->user()->participatedGroups()->with('participants.profils.medicaments')->findOrFail($id);

        return response()->json($groupe);
    }

    /**
     * Inviter/Ajouter un utilisateur par e-mail.
     */
    public function addUser(Request $request, $id)
    {
        $groupe = $request->user()->participatedGroups()->wherePivot('role', 'proprietaire')->findOrFail($id);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $userToAdd = User::where('email', $validated['email'])->first();

        if ($userToAdd->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas vous ajouter vous-même'], 400);
        }

        if ($groupe->participants()->where('users.id', $userToAdd->id)->exists()) {
            return response()->json(['message' => 'Utilisateur déjà dans le groupe'], 400);
        }

        $groupe->participants()->attach($userToAdd->id, ['role' => 'membre']);

        ActivityLog::log('GROUP_MEMBER_ADD', "Membre ajouté au groupe {$groupe->nom} : {$userToAdd->name}");

        return response()->json(['message' => 'Utilisateur ajouté au groupe avec succès.', 'groupe' => $groupe->load('participants:id,name,email')]);
    }

    /**
     * Supprimer un groupe.
     */
    public function destroy(Request $request, $id)
    {
        $groupe = $request->user()->participatedGroups()->wherePivot('role', 'proprietaire')->findOrFail($id);
        $nom = $groupe->nom;
        $groupe->delete();

        ActivityLog::log('GROUP_DELETE', "Groupe supprimé : {$nom}");

        return response()->json(['message' => 'Groupe supprimé avec succès.']);
    }
}
