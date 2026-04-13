<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicamentRequest;
use App\Http\Resources\MedicamentResource;
use App\Models\ActivityLog;
use App\Models\Profil;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Contrôleur des médicaments.
 *
 * Gère le CRUD complet des médicaments pour un profil donné.
 * Toutes les opérations sont scopées au profil de l'utilisateur connecté
 * pour garantir la sécurité et l'isolation des données.
 */
class MedicamentController extends Controller
{
    /**
     * Lister tous les médicaments d'un profil.
     *
     * @param  int  $profilId  Identifiant du profil
     * @return JsonResponse Liste des médicaments
     */
    public function index(Request $request, int $profilId): JsonResponse
    {
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $medicaments = $profil->medicaments()
            ->with(['rappels'])
            ->orderBy('nom')
            ->get();

        return response()->json([
            'profil' => $profil->only(['id', 'nom', 'relation']),
            'medicaments' => MedicamentResource::collection($medicaments),
            'total' => $medicaments->count(),
        ]);
    }

    /**
     * Créer un nouveau médicament pour un profil.
     *
     * @param  MedicamentRequest  $request  Données validées du médicament
     * @param  int  $profilId  Identifiant du profil
     * @return JsonResponse Le médicament créé
     */
    public function store(MedicamentRequest $request, int $profilId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return \DB::transaction(function () use ($request, $profil, $profilId) {
            // Créer le médicament associé au profil
            $medicament = $profil->medicaments()->create($request->validated());

            // Gérer les rappels s'ils sont fournis dans la requête
            if ($request->has('rappels')) {
                foreach ($request->input('rappels') as $rappelData) {
                    $medicament->rappels()->create([
                        'heure' => $rappelData['heure'],
                        'moment' => $rappelData['moment'] ?? 'libre',
                    ]);
                }
            }

            ActivityLog::log('MED_ADD', "Médicament ajouté : {$medicament->nom} pour {$profil->nom}");

            try {
                broadcast(new \App\Events\DataChanged('medicament', $profilId))->toOthers();
            } catch (\Exception $e) {
                \Log::error("Broadcasting failed in MedicamentController@store: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Médicament ajouté avec succès.',
                'medicament' => $medicament->load('rappels'),
            ], 201);
        });
    }

    /**
     * Afficher les détails d'un médicament spécifique.
     *
     * @param  int  $profilId  Identifiant du profil
     * @param  int  $medicamentId  Identifiant du médicament
     * @return JsonResponse Détail du médicament
     */
    public function show(Request $request, int $profilId, int $medicamentId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Récupérer le médicament appartenant à ce profil avec ses relations
        $medicament = $profil->medicaments()
            ->with(['rappels', 'achats'])
            ->findOrFail($medicamentId);

        return response()->json([
            'medicament' => array_merge($medicament->toArray(), [
                'stock_faible' => $medicament->stock_faible,
                'expire' => $medicament->expire,
                'traitement_actif' => $medicament->traitement_actif,
            ]),
        ]);
    }

    /**
     * Mettre à jour un médicament existant.
     *
     * @param  MedicamentRequest  $request  Données validées (partielles acceptées)
     * @param  int  $profilId  Identifiant du profil
     * @param  int  $medicamentId  Identifiant du médicament
     * @return JsonResponse Le médicament mis à jour
     */
    public function update(MedicamentRequest $request, int $profilId, int $medicamentId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $medicament = $profil->medicaments()->findOrFail($medicamentId);

        return \DB::transaction(function () use ($request, $medicament, $profilId) {
            $medicament->update($request->validated());

            // Gérer les rappels (Synchronisation complète)
            if ($request->has('rappels')) {
                $incomingRappels = $request->input('rappels');
                $incomingIds = collect($incomingRappels)->pluck('id')->filter()->toArray();
                
                // 1. Supprimer les rappels qui ne sont plus dans la liste
                $medicament->rappels()->whereNotIn('id', $incomingIds)->delete();

                // 2. Mettre à jour ou créer les rappels
                foreach ($incomingRappels as $rappelData) {
                    if (isset($rappelData['id'])) {
                        $medicament->rappels()->where('id', $rappelData['id'])->update([
                            'heure' => $rappelData['heure'],
                            'moment' => $rappelData['moment'] ?? 'libre',
                        ]);
                    } else {
                        $medicament->rappels()->create([
                            'heure' => $rappelData['heure'],
                            'moment' => $rappelData['moment'] ?? 'libre',
                        ]);
                    }
                }
            }

            ActivityLog::log('MED_UPDATE', "Médicament mis à jour : {$medicament->nom}");

            try {
                broadcast(new \App\Events\DataChanged('medicament', $profilId))->toOthers();
            } catch (\Exception $e) {
                \Log::error("Broadcasting failed in MedicamentController@update: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Médicament mis à jour avec succès.',
                'medicament' => $medicament->fresh()->load('rappels'),
            ]);
        });
    }

    /**
     * Supprimer un médicament.
     *
     * @param  int  $profilId  Identifiant du profil
     * @param  int  $medicamentId  Identifiant du médicament
     * @return JsonResponse Confirmation de suppression
     */
    public function destroy(Request $request, int $profilId, int $medicamentId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $medicament = $profil->medicaments()->findOrFail($medicamentId);
        $nomMedicament = $medicament->nom;
        $medicament->delete();


        ActivityLog::log('MED_DELETE', "Médicament supprimé : {$nomMedicament}");

        try {
            broadcast(new \App\Events\DataChanged('medicament', $profilId))->toOthers();
        } catch (\Exception $e) {
            \Log::error("Broadcasting failed in MedicamentController@destroy: " . $e->getMessage());
        }

        return response()->json([
            'message' => "Le médicament \"{$nomMedicament}\" a été supprimé avec succès.",
        ]);
    }
}
