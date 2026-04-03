<?php

namespace App\Http\Controllers;

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
        return response()->json($request->user()->groupes()->with('membres:id,name,email')->get());
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
            'nom'             => $validated['nom'],
            'proprietaire_id' => $request->user()->id,
        ]);

        // Attacher le propriétaire en tant que rôle 'proprietaire'
        $groupe->membres()->attach($request->user()->id, ['role' => 'proprietaire']);

        return response()->json($groupe->load('membres:id,name,email'), 201);
    }

    /**
     * Afficher un groupe et ses profils partagés.
     * Logique: on retourne tous les profils des membres du groupe.
     */
    public function show(Request $request, $id)
    {
        $groupe = $request->user()->groupes()->with('membres.profils.medicaments')->findOrFail($id);
        return response()->json($groupe);
    }

    /**
     * Inviter/Ajouter un utilisateur par e-mail.
     */
    public function addUser(Request $request, $id)
    {
        $groupe = $request->user()->groupes()->wherePivot('role', 'proprietaire')->findOrFail($id);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $userToAdd = User::where('email', $validated['email'])->first();

        if ($groupe->membres()->where('user_id', $userToAdd->id)->exists()) {
            return response()->json(['message' => 'Utilisateur déjà dans le groupe'], 400);
        }

        $groupe->membres()->attach($userToAdd->id, ['role' => 'membre']);

        return response()->json(['message' => 'Utilisateur ajouté au groupe avec succès.', 'groupe' => $groupe->load('membres:id,name,email')]);
    }

    /**
     * Supprimer un groupe.
     */
    public function destroy(Request $request, $id)
    {
        $groupe = $request->user()->groupes()->wherePivot('role', 'proprietaire')->findOrFail($id);
        $groupe->delete();
        return response()->json(['message' => 'Groupe supprimé avec succès.']);
    }
}
