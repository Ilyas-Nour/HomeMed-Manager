<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\Medicament;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Statistiques globales pour l'administrateur.
     */
    public function stats(Request $request)
    {
        return response()->json([
            'users_count' => User::count(),
            'meds_count' => Medicament::count(),
            'low_stock_count' => Medicament::whereColumn('quantite', '<=', 'seuil_alerte')->count(),
            'total_purchases' => Achat::sum('prix'),
        ]);
    }

    /**
     * Liste des utilisateurs pour supervision.
     */
    public function users(Request $request)
    {
        return response()->json(User::withCount('profils')->get());
    }
}
