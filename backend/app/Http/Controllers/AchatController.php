<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AchatController extends Controller
{
    /**
     * Liste des achats/shopping list (sécurisée par ownership).
     */
    public function index(Request $request)
    {
        $statut = $request->query('statut'); // 'pending' ou 'completed'
        
        $medicamentIds = auth()->user()->medicaments()->pluck('medicaments.id');
        
        $query = Achat::whereIn('medicament_id', $medicamentIds)
            ->with('medicament');

        if ($statut) {
            $query->where('statut', $statut);
        }

        $achats = $query->orderByDesc('updated_at')->get();

        return response()->json($achats);
    }

    /**
     * Ajouter un article à la shopping list ou enregistrer un achat direct.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicament_id' => 'required|exists:medicaments,id',
            'statut'        => 'nullable|in:pending,completed',
            'label'         => 'nullable|string|max:50',
            'quantite'      => 'required|integer|min:1',
            'prix'          => 'nullable|numeric',
            'pharmacie'     => 'nullable|string',
        ]);

        // Sécurité : Vérifier que le médicament appartient à l'utilisateur
        $medicament = auth()->user()->medicaments()->findOrFail($validated['medicament_id']);

        return DB::transaction(function () use ($validated, $medicament) {
            $validated['statut'] = $validated['statut'] ?? Achat::STATUT_PENDING;
            
            if ($validated['statut'] === Achat::STATUT_COMPLETED) {
                $validated['date_achat'] = now();
                $medicament->increment('quantite', $validated['quantite']);
                ActivityLog::log('ACHAT_ADD', "Achat immédiat : {$validated['quantite']} unités pour {$medicament->nom}");
            } else {
                ActivityLog::log('SHOPPING_ADD', "Ajouté à la liste : {$medicament->nom} ({$validated['label']})");
            }

            $achat = Achat::create($validated);

            return response()->json($achat, 201);
        });
    }

    /**
     * Voir les détails d'un achat.
     */
    public function show(Achat $achat)
    {
        if ($achat->medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        return response()->json($achat->load('medicament'));
    }

    /**
     * Marquer un article comme acheté (Shopping List fulfillment).
     */
    public function update(Request $request, Achat $achat)
    {
        // Sécurité
        if ($achat->medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $validated = $request->validate([
            'statut'    => 'required|in:pending,completed',
            'prix'      => 'nullable|numeric',
            'pharmacie' => 'nullable|string',
            'quantite'  => 'nullable|integer|min:1',
        ]);

        return DB::transaction(function () use ($achat, $validated) {
            $oldStatut = $achat->statut;
            $oldQuantite = $achat->quantite;
            
            $achat->update($validated);
            $achat->refresh(); // Pour avoir les nouvelles valeurs si besoin

            // Cas 1 : Passage de "À acheter" à "Acheté" -> Incrément complet
            if ($oldStatut === Achat::STATUT_PENDING && $achat->statut === Achat::STATUT_COMPLETED) {
                $achat->update(['date_achat' => now()]);
                $achat->medicament->increment('quantite', $achat->quantite);
                ActivityLog::log('ACHAT_COMPLETE', "Achat validé : {$achat->quantite} unités pour {$achat->medicament->nom}");
            } 
            // Cas 2 : Déjà "Acheté", mais on modifie la quantité -> Ajustement différentiel
            elseif ($oldStatut === Achat::STATUT_COMPLETED && $achat->statut === Achat::STATUT_COMPLETED) {
                if (isset($validated['quantite']) && $validated['quantite'] != $oldQuantite) {
                    $diff = $validated['quantite'] - $oldQuantite;
                    if ($diff > 0) {
                        $achat->medicament->increment('quantite', $diff);
                    } else {
                        $achat->medicament->decrement('quantite', abs($diff));
                    }
                    ActivityLog::log('ACHAT_ADJUST', "Quantité achat modifiée : rectification de " . ($diff > 0 ? "+$diff" : $diff) . " stock");
                }
            }

            return response()->json($achat->load('medicament'));
        });
    }

    /**
     * Supprimer un article (ou corriger un achat).
     */
    public function destroy(Achat $achat)
    {
        if ($achat->medicament->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        return DB::transaction(function () use ($achat) {
            $medicament = $achat->medicament;

            // Si l'achat était déjà complété, on rectifie le stock
            if ($achat->statut === Achat::STATUT_COMPLETED) {
                if ($medicament->quantite >= $achat->quantite) {
                    $medicament->decrement('quantite', $achat->quantite);
                } else {
                    $medicament->update(['quantite' => 0]);
                }
            }

            $achat->delete();

            return response()->json(['message' => 'Supprimé avec succès']);
        });
    }
}
