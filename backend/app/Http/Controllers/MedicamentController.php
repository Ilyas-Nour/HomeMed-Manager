<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicamentRequest;
use App\Models\Medicament;
use App\Models\Profil;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Resources\MedicamentResource;

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
     * @param Request $request
     * @param int $profilId Identifiant du profil
     * @return JsonResponse Liste des médicaments
     */
    public function index(Request $request, int $profilId): JsonResponse
    {
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // On récupère les médicaments triés. 
        // Note: Les attributs calculés (stock_faible, expire) sont gérés par MedicamentResource.
        $medicaments = $profil->medicaments()
            ->orderBy('nom')
            ->get();

        return response()->json([
            'profil'       => $profil->only(['id', 'nom', 'relation']),
            'medicaments'  => MedicamentResource::collection($medicaments),
            'total'        => $medicaments->count(),
        ]);
    }

    /**
     * Créer un nouveau médicament pour un profil.
     *
     * @param MedicamentRequest $request Données validées du médicament
     * @param int $profilId Identifiant du profil
     * @return JsonResponse Le médicament créé
     */
    public function store(MedicamentRequest $request, int $profilId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Créer le médicament associé au profil
        $medicament = $profil->medicaments()->create($request->validated());

        \App\Models\ActivityLog::log('MED_ADD', "Médicament ajouté : {$medicament->nom} pour {$profil->nom}");

        return response()->json([
            'message'     => 'Médicament ajouté avec succès.',
            'medicament'  => $medicament,
        ], 201);
    }

    /**
     * Afficher les détails d'un médicament spécifique.
     *
     * @param Request $request
     * @param int $profilId Identifiant du profil
     * @param int $medicamentId Identifiant du médicament
     * @return JsonResponse Détail du médicament
     */
    public function show(Request $request, int $profilId, int $medicamentId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Récupérer le médicament appartenant à ce profil
        $medicament = $profil->medicaments()->findOrFail($medicamentId);

        return response()->json([
            'medicament' => array_merge($medicament->toArray(), [
                'stock_faible'      => $medicament->stock_faible,
                'expire'            => $medicament->expire,
                'traitement_actif'  => $medicament->traitement_actif,
            ]),
        ]);
    }

    /**
     * Mettre à jour un médicament existant.
     *
     * @param MedicamentRequest $request Données validées (partielles acceptées)
     * @param int $profilId Identifiant du profil
     * @param int $medicamentId Identifiant du médicament
     * @return JsonResponse Le médicament mis à jour
     */
    public function update(MedicamentRequest $request, int $profilId, int $medicamentId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Récupérer et mettre à jour le médicament
        $medicament = $profil->medicaments()->findOrFail($medicamentId);
        $medicament->update($request->validated());

        return response()->json([
            'message'     => 'Médicament mis à jour avec succès.',
            'medicament'  => $medicament->fresh(),
        ]);
    }

    /**
     * Supprimer un médicament.
     *
     * @param Request $request
     * @param int $profilId Identifiant du profil
     * @param int $medicamentId Identifiant du médicament
     * @return JsonResponse Confirmation de suppression
     */
    public function destroy(Request $request, int $profilId, int $medicamentId): JsonResponse
    {
        // Vérifier que le profil appartient à l'utilisateur connecté
        $profil = Profil::where('id', $profilId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Récupérer et supprimer le médicament
        $medicament = $profil->medicaments()->findOrFail($medicamentId);
        $nomMedicament = $medicament->nom;
        $medicament->delete();

        \App\Models\ActivityLog::log('MED_DELETE', "Médicament supprimé : {$nomMedicament}");

        return response()->json([
            'message' => "Le médicament \"{$nomMedicament}\" a été supprimé avec succès.",
        ]);
    }
}
