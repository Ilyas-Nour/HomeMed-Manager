<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use Illuminate\Http\Request;

class AchatController extends Controller
{
    /**
     * Liste des achats pour un médicament.
     */
    public function index(Request $request)
    {
        $medicamentId = $request->query('medicament_id');
        if (!$medicamentId) {
            return response()->json(['message' => 'medicament_id requis'], 400);
        }
        
        $achats = Achat::where('medicament_id', $medicamentId)
                    ->orderByDesc('date_achat')
                    ->get();
                    
        return response()->json($achats);
    }

    /**
     * Enregistrer un nouvel achat et mettre à jour le stock.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicament_id' => 'required|exists:medicaments,id',
            'pharmacie'     => 'required|string|max:255',
            'prix'          => 'required|numeric|min:0',
            'quantite'      => 'required|integer|min:1',
            'date_achat'    => 'required|date',
        ]);

        $achat = Achat::create($validated);

        // Mise à jour automatique du stock du médicament (Requirement 3.5/3.6)
        $medicament = $achat->medicament;
        $medicament->increment('quantite', $validated['quantite']);

        return response()->json([
            'message' => 'Achat enregistré et stock mis à jour',
            'achat'   => $achat,
            'nouveau_stock' => $medicament->quantite
        ], 201);
    }

    /**
     * Supprimer un enregistrement d'achat (n'annule pas le stock par défaut pour éviter les erreurs, 
     * mais on pourrait le faire si besoin).
     */
    public function destroy(Achat $achat)
    {
        $achat->delete();
        return response()->json(null, 204);
    }
}
