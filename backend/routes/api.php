<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedicamentController;
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

    // ——————————————————————————————————————————
    // Médicaments — CRUD scopé par profil
    // ——————————————————————————————————————————
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
    Route::get('medicaments/{medicament}/rappels', [App\Http\Controllers\RappelController::class, 'index']);
    Route::post('medicaments/{medicament}/rappels', [App\Http\Controllers\RappelController::class, 'store']);
    Route::delete('rappels/{rappel}', [App\Http\Controllers\RappelController::class, 'destroy']);

    // Suivi quotidien des prises
    Route::get('profils/{profil}/timeline', [App\Http\Controllers\PriseController::class, 'index']);
    Route::post('rappels/{rappel}/toggle', [App\Http\Controllers\PriseController::class, 'toggle']);

    // ——————————————————————————————————————————
    // Profils (Phase 3)
    // ——————————————————————————————————————————
    Route::apiResource('profils', App\Http\Controllers\ProfilController::class)->only(['store', 'update', 'destroy']);

    // ——————————————————————————————————————————
    // Gestion des Achats (Requirement 3.6)
    // ——————————————————————————————————————————
    Route::get('achats', [App\Http\Controllers\AchatController::class, 'index']);
    Route::post('achats', [App\Http\Controllers\AchatController::class, 'store']);
    Route::delete('achats/{achat}', [App\Http\Controllers\AchatController::class, 'destroy']);

    // ——————————————————————————————————————————
    // Administration & Supervision (Requirement 4)
    // ——————————————————————————————————————————
    Route::get('admin/stats', [App\Http\Controllers\AdminController::class, 'stats']);
    Route::get('admin/users', [App\Http\Controllers\AdminController::class, 'users']);

    // ——————————————————————————————————————————
    // Groupes Collaboratifs (Phase 3)
    // ——————————————————————————————————————————
    Route::get('groupes', [App\Http\Controllers\GroupeController::class, 'index']);
    Route::post('groupes', [App\Http\Controllers\GroupeController::class, 'store']);
    Route::get('groupes/{groupe}', [App\Http\Controllers\GroupeController::class, 'show']);
    Route::delete('groupes/{groupe}', [App\Http\Controllers\GroupeController::class, 'destroy']);
    Route::post('groupes/{groupe}/add-user', [App\Http\Controllers\GroupeController::class, 'addUser']);
});
