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
});
