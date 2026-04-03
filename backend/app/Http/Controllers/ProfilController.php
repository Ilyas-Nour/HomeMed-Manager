<?php

namespace App\Http\Controllers;

use App\Models\Profil;
use Illuminate\Http\Request;

class ProfilController extends Controller
{
    /**
     * Store a newly created profil.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'relation' => 'required|string|max:255',
        ]);

        $profil = $request->user()->profils()->create($validated);

        return response()->json(['message' => 'Profil créé avec succès.', 'profil' => $profil], 201);
    }

    /**
     * Update the specified profil in storage.
     */
    public function update(Request $request, Profil $profil)
    {
        if ($profil->user_id !== $request->user()->id) {
            abort(403, 'Accès refusé.');
        }

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'relation' => 'sometimes|required|string|max:255',
        ]);

        $profil->update($validated);

        return response()->json(['message' => 'Profil mis à jour.', 'profil' => $profil]);
    }

    /**
     * Remove the specified profil from storage.
     */
    public function destroy(Request $request, Profil $profil)
    {
        if ($profil->user_id !== $request->user()->id) {
            abort(403, 'Accès refusé.');
        }

        $profil->delete();

        return response()->json(['message' => 'Profil supprimé.']);
    }
}
