<?php

use App\Http\Controllers\AchatController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\MasterMedicamentController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\PriseController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\RappelController;
use App\Http\Controllers\PlanningController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes API — HomeMed Manager
|--------------------------------------------------------------------------
|
| Routes publiques : accessibles sans authentification (inscription, connexion)
| Routes protégées : nécessitent un token Sanctum valide (middleware auth:sanctum)
|
*/

// ——————————————————————————————————————————
// Routes publiques — Authentification
// ——————————————————————————————————————————
Route::prefix('auth')->group(function () {
    // Inscription d'un nouvel utilisateur
    Route::post('/inscription', [AuthController::class, 'register']);

    // Connexion avec email et mot de passe
    Route::post('/connexion', [AuthController::class, 'login']);
});

// ——————————————————————————————————————————
// Routes protégées — Authentification requise
// ——————————————————————————————————————————
Route::middleware('auth:sanctum')->group(function () {

    // Déconnexion (révocation du token courant)
    Route::post('/auth/deconnexion', [AuthController::class, 'logout']);

    // Récupérer les informations de l'utilisateur connecté
    Route::get('/auth/moi', [AuthController::class, 'moi']);
    Route::patch('/auth/update', [AuthController::class, 'updateAccount']);

    // Médicaments — CRUD scopé par profil / Suggestions
    Route::get('/master-medicaments', [MasterMedicamentController::class, 'index']);
    Route::prefix('profils/{profilId}/medicaments')->group(function () {
        // Liste des médicaments du profil
        Route::get('/', [MedicamentController::class, 'index']);

        // Créer un médicament
        Route::post('/', [MedicamentController::class, 'store']);

        // Détail d'un médicament
        Route::get('/{medicamentId}', [MedicamentController::class, 'show']);

        // Mettre à jour un médicament (mise à jour partielle acceptée)
        Route::patch('/{medicamentId}', [MedicamentController::class, 'update']);

        // Supprimer un médicament
        Route::delete('/{medicamentId}', [MedicamentController::class, 'destroy']);
    });

    // ——————————————————————————————————————————
    // Rappels & Suivi des Prises (Phase 2)
    // ——————————————————————————————————————————

    // Gestion des rappels par médicament
    Route::get('medicaments/{medicament}/rappels', [RappelController::class, 'index']);
    Route::post('medicaments/{medicament}/rappels', [RappelController::class, 'store']);
    Route::delete('rappels/{rappel}', [RappelController::class, 'destroy']);

    // Suivi quotidien des prises
    Route::get('profils/{profil}/timeline', [PriseController::class, 'index']);
    Route::post('rappels/{rappel}/toggle', [PriseController::class, 'toggle']);

    // ——————————————————————————————————————————
    // Profils (Phase 3)
    // ——————————————————————————————————————————
    Route::apiResource('profils', ProfilController::class)->only(['index', 'store', 'update', 'destroy']);

    // ——————————————————————————————————————————
    // Gestion des Achats (Requirement 3.6)
    // ——————————————————————————————————————————
    // Planning & Suivi des prises
    Route::get('/planning', [PlanningController::class, 'index']);
    Route::post('/prises/toggle', [PriseController::class, 'toggle']);

    // Achats (Shopping List)
    Route::apiResource('achats', AchatController::class)->except(['show']);

    // ——————————————————————————————————————————
    // Administration & Supervision (Requirement 4)
    // ——————————————————————————————————————————
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
    });

    // ——————————————————————————————————————————
    // Groupes Collaboratifs (Phase 3)
    // ——————————————————————————————————————————
    Route::get('groupes', [GroupeController::class, 'index']);
    Route::post('groupes', [GroupeController::class, 'store']);
    Route::post('groupes/accept', [GroupeController::class, 'acceptInvite']);
    Route::get('groupes/{groupe}', [GroupeController::class, 'show']);
    Route::delete('groupes/{groupe}', [GroupeController::class, 'destroy']);
    Route::post('groupes/{groupe}/add-user', [GroupeController::class, 'addUser']);
});
