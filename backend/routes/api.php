<?php

use App\Http\Controllers\AchatController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\MasterMedicamentController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\PriseController;
use App\Http\Controllers\RappelController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SharedPharmacyController;
use App\Http\Controllers\MedicamentRequestController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AIChatController;
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
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'status' => 'success'
    ]);
});

Route::get('/settings/public', [\App\Http\Controllers\SystemSettingsController::class, 'index']);

Route::prefix('auth')->group(function () {
    // Inscription d'un nouvel utilisateur
    Route::post('/inscription', [AuthController::class, 'register']);

    // Connexion avec email et mot de passe
    Route::post('/connexion', [AuthController::class, 'login']);

    // Vérification d'e-mail avant inscription
    Route::post('/envoyer-code', [AuthController::class, 'sendVerificationCode']);
    Route::post('/verifier-code', [AuthController::class, 'verifyCode']);

    // Google Social Login
    Route::get('/google/redirect', [\App\Http\Controllers\SocialAuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [\App\Http\Controllers\SocialAuthController::class, 'handleGoogleCallback']);
    // Mot de passe oublié
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// ——————————————————————————————————————————
// Routes protégées — Authentification requise
// ——————————————————————————————————————————
Route::middleware('auth:sanctum')->group(function () {
    // Authentification pour les canaux privés (WebSockets)
    Route::post('/broadcasting/auth', function (Illuminate\Http\Request $request) {
        return Broadcast::auth($request);
    });


    // Déconnexion (révocation du token courant)
    Route::post('/auth/deconnexion', [AuthController::class, 'logout']);

    // Récupérer les informations de l'utilisateur connecté
    Route::get('/auth/moi', [AuthController::class, 'moi']);
    Route::patch('/auth/update', [AuthController::class, 'updateAccount']);

    // Dashboard Unifié (Performance)
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // Médicaments — CRUD scopé par profil / Suggestions
    Route::get('/master-medicaments', [MasterMedicamentController::class, 'index']);
    Route::prefix('profils/{profilId}/medicaments')->group(function () {
        // Liste des médicaments du profil
        Route::get('/', [MedicamentController::class, 'index']);

        // Créer un médicament
        Route::post('/', [MedicamentController::class, 'store']);

        // Détail d'un médicament
        Route::get('/{medicamentId}', [MedicamentController::class, 'show']);

        // Mettre à jour un médicament (PUT ou PATCH acceptés)
        Route::match(['PUT', 'PATCH'], '/{medicamentId}', [MedicamentController::class, 'update']);

        // Supprimer un médicament
        Route::delete('/{medicamentId}', [MedicamentController::class, 'destroy']);
    });

    // ——————————————————————————————————————————
    // Rappels & Suivi des Prises (Phase 2)
    // ——————————————————————————————————————————

    // Gestion des rappels par médicament
    Route::get('medicaments/{medicament}/rappels', [RappelController::class, 'index']);
    Route::post('medicaments/{medicament}/rappels', [RappelController::class, 'store']);
    Route::match(['PUT', 'PATCH'], 'medicaments/{medicament}/rappels/{rappel}', [RappelController::class, 'update']);
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
    Route::get('/planning/due', [PlanningController::class, 'due']);
    Route::post('/prises/toggle', [PriseController::class, 'toggle']);

    // Achats (Shopping List)
    Route::apiResource('achats', AchatController::class)->except(['show']);


    // ——————————————————————————————————————————
    // Groupes Collaboratifs (Phase 3)
    // ——————————————————————————————————————————
    Route::get('groupes', [GroupeController::class, 'index']);
    Route::post('groupes', [GroupeController::class, 'store']);
    Route::post('groupes/accept', [GroupeController::class, 'acceptInvite']);
    Route::get('groupes/{groupe}', [GroupeController::class, 'show']);
    Route::delete('groupes/{groupe}', [GroupeController::class, 'destroy']);
    // ——————————————————————————————————————————
    // Notifications & Préférences
    // ——————————————————————————————————————————
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications', [NotificationController::class, 'store']);
    Route::get('notifications/preferences', [NotificationPreferenceController::class, 'index']);
    Route::patch('notifications/preferences', [NotificationPreferenceController::class, 'update']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/clear-all', [NotificationController::class, 'clearAll']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);

    // ——————————————————————————————————————————
    // Analytical Reports
    // ——————————————————————————————————————————
    Route::get('reports/summary', [ReportController::class, 'summary']);
    Route::get('reports/history', [ReportController::class, 'history']);

    // ——————————————————————————————————————————
    // Partage & Collaborations (Requirement Sharing)
    // ——————————————————————————————————————————
    Route::get('/collaboration/count', [NotificationController::class, 'collaborationCount']);
    Route::get('groupes/{groupe}/pharmacie', [SharedPharmacyController::class, 'index']);

    Route::prefix('partage')->group(function () {
        Route::get('/demandes', [MedicamentRequestController::class, 'index']);
        Route::post('/demandes', [MedicamentRequestController::class, 'store']);
        Route::get('/demandes/{medRequest}', [MedicamentRequestController::class, 'show']);
        Route::patch('/demandes/{medRequest}', [MedicamentRequestController::class, 'update']);

        // Chat lié à une demande
        Route::get('/demandes/{medRequest}/messages', [ChatController::class, 'index']);
        Route::post('/demandes/{medRequest}/messages', [ChatController::class, 'store']);
        Route::post('/demandes/{medRequest}/read', [ChatController::class, 'markAsRead']);
    });

    // AI Chat Bridge
    Route::post('/ai/chat', [AIChatController::class, 'chat']);
});
