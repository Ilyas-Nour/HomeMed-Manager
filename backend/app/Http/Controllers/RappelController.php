<?php

namespace App\Http\Controllers;

use App\Models\Rappel;
use App\Models\Medicament;
use Illuminate\Http\Request;

class RappelController extends Controller
{
    /**
     * Liste des rappels pour un médicament spécifique.
     */
    public function index(Medicament $medicament)
    {
        return response()->json($medicament->rappels()->orderBy('heure')->get());
    }

    /**
     * Création d'un nouveau rappel.
     */
    public function store(Request $request, Medicament $medicament)
    {
        $validated = $request->validate([
            'moment' => 'required|string|in:matin,midi,soir,apres-midi,coucher,libre',
            'heure'  => 'required|date_format:H:i',
        ]);

        $rappel = $medicament->rappels()->create($validated);
        return response()->json($rappel, 201);
    }

    /**
     * Suppression d'un rappel.
     */
    public function destroy(Rappel $rappel)
    {
        $rappel->delete();
        return response()->json(null, 204);
    }
}
