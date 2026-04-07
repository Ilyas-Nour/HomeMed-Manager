<?php

namespace App\Http\Controllers;

use App\Models\MasterMedicament;
use Illuminate\Http\Request;

class MasterMedicamentController extends Controller
{
    /**
     * Rechercher des suggestions de médicaments.
     */
    public function index(Request $request)
    {
        $query = $request->query('q');

        if (! $query || strlen($query) < 2) {
            return response()->json([]);
        }

        $meds = MasterMedicament::where('nom', 'LIKE', "{$query}%")
            ->orWhere('nom', 'LIKE', "% {$query}%")
            ->orderBy('nom')
            ->take(8)
            ->get();

        return response()->json($meds);
    }
}
