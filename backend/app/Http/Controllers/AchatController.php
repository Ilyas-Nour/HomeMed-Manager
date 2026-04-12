<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Events\DataChanged;

class AchatController extends Controller
{
    /**
     * Liste des achats/shopping list (sécurisée par ownership).
     */
    public function index(Request $request)
    {
        $statut = $request->query('statut');
        $profilId = $request->header('X-Profil-Id');

        if (!$profilId) {
            return response()->json(['message' => 'Profil non spécifié'], 400);
        }

        // Vérifier que le profil appartient à l'utilisateur
        auth()->user()->profils()->findOrFail($profilId);

        $query = Achat::where('profil_id', $profilId)
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
            'medicament_id'       => 'nullable|exists:medicaments,id',
            'medicament_nom_temp' => 'nullable|string|max:100|required_without:medicament_id',
            'statut'              => 'nullable|in:pending,completed',
            'label'               => 'nullable|string|max:50',
            'quantite'            => 'required|integer|min:1',
            'prix'                => 'nullable|numeric',
            'pharmacie'           => 'nullable|string',
            'date_achat'          => 'nullable|date',
        ]);

        $profilId = $request->header('X-Profil-Id');
        if (!$profilId) {
            return response()->json(['message' => 'Profil non spécifié'], 400);
        }

        // Vérifier l'appartenance du profil
        $profil = auth()->user()->profils()->findOrFail($profilId);
        $validated['profil_id'] = $profil->id;

        $medicament = null;
        if (isset($validated['medicament_id'])) {
            $medicament = $profil->medicaments()->findOrFail($validated['medicament_id']);
        }

        return DB::transaction(function () use ($validated, $medicament, $profil, $profilId, $request) {
            $validated['statut'] = $validated['statut'] ?? Achat::STATUT_PENDING;
            
            if ($validated['statut'] === Achat::STATUT_COMPLETED) {
                $validated['date_achat'] = $validated['date_achat'] ?? now();
                
                // Si c'est un nouveau médicament (pas d'ID), on le crée immédiatement
                if (!$medicament && !empty($validated['medicament_nom_temp'])) {
                    $medicament = $profil->medicaments()->create([
                        'nom' => $validated['medicament_nom_temp'],
                        'type' => 'autre',
                        'posologie' => 'À définir', // Champ obligatoire
                        'date_debut' => now(),
                        'quantite' => 0, // Sera incrémenté juste après
                        'seuil_alerte' => 2,
                    ]);
                    $validated['medicament_id'] = $medicament->id;
                    $validated['medicament_nom_temp'] = null;
                }

                if ($medicament) {
                    $medicament->increment('quantite', $validated['quantite']);
                    ActivityLog::log('ACHAT_ADD', "Achat immédiat : {$validated['quantite']} unités pour " . ($medicament->nom));
                }
            } else {
                $nom = $medicament ? $medicament->nom : $validated['medicament_nom_temp'];
                ActivityLog::log('SHOPPING_ADD', "Ajouté à la liste : {$nom} ({$validated['label']})");
            }

            $achat = Achat::create($validated);

            // Cache and real-time state synchronization
            Cache::forget("medicaments_{$profilId}");
            Cache::forget("dashboard_summary_{$profilId}_" . now()->toDateString());

            broadcast(new DataChanged('inventory_updated', $profilId))->toOthers();

            return response()->json($achat->load('medicament'), 201);
        });
    }

    /**
     * Voir les détails d'un achat.
     */
    public function show(Achat $achat)
    {
        // Vérifier ownership via profil
        if ($achat->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        return response()->json($achat->load('medicament'));
    }

    /**
     * Marquer un article comme acheté (Shopping List fulfillment).
     */
    public function update(Request $request, Achat $achat)
    {
        // Sécurité via profil
        if ($achat->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $validated = $request->validate([
            'statut'    => 'required|in:pending,completed',
            'prix'      => 'nullable|numeric',
            'pharmacie' => 'nullable|string',
            'quantite'  => 'nullable|integer|min:1',
        ]);

        return DB::transaction(function () use ($achat, $validated, $request) {
            $oldStatut = $achat->statut;
            $oldQuantite = $achat->quantite;
            
            // Logique de création de Médicament si c'était un "Nouveau" (temp name)
            if ($oldStatut === Achat::STATUT_PENDING && $validated['statut'] === Achat::STATUT_COMPLETED) {
                if (!$achat->medicament_id && $achat->medicament_nom_temp) {
                    $profil = $achat->profil;
                    $newMed = $profil->medicaments()->create([
                        'nom' => $achat->medicament_nom_temp,
                        'type' => 'autre',
                        'posologie' => 'À définir', // Champ obligatoire
                        'date_debut' => now(),
                        'quantite' => 0,
                        'seuil_alerte' => 2,
                    ]);
                    $achat->medicament_id = $newMed->id;
                    $achat->medicament_nom_temp = null;
                    $achat->save();
                    // On refresh l'achat pour être sûr que la relation 'medicament' pointe sur le nouvel objet
                    $achat->refresh();
                    $achat->load('medicament');
                }
            }

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

            // Invalider le cache
            $profilId = $achat->profil_id;
            Cache::forget("medicaments_{$profilId}");
            broadcast(new DataChanged('inventory_updated', $achat->profil_id))->toOthers();

            return response()->json($achat->load('medicament'));
        });
    }

    /**
     * Supprimer un article (ou corriger un achat).
     */
    public function destroy(Achat $achat)
    {
        if ($achat->profil->user_id !== auth()->id()) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        return DB::transaction(function () use ($achat) {
            $medicament = $achat->medicament;

            // Si l'achat était déjà complété et relié à un médoc, on rectifie le stock
            if ($achat->statut === Achat::STATUT_COMPLETED && $medicament) {
                if ($medicament->quantite >= $achat->quantite) {
                    $medicament->decrement('quantite', $achat->quantite);
                } else {
                    $medicament->update(['quantite' => 0]);
                }
            }

            $profilId = $achat->profil_id;
            $achat->delete();

            // Invalider le cache
            Cache::forget("medicaments_{$profilId}");
            broadcast(new DataChanged('inventory_updated', $profilId))->toOthers();

            return response()->json(['message' => 'Supprimé avec succès']);
        });
    }
}
