<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Profil;
use App\Models\User;
use App\Mail\VerificationMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Contrôleur d'authentification.
 *
 * Gère l'inscription, la connexion, la déconnexion et
 * la récupération des informations de l'utilisateur connecté.
 * Utilise Laravel Sanctum pour la gestion des tokens API.
 */
class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur.
     *
     * Crée le compte utilisateur et génère automatiquement
     * un profil par défaut "Moi-même" pour lui.
     *
     * @param  RegisterRequest  $request  Données validées de l'inscription
     * @return JsonResponse Token d'accès + infos utilisateur
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Vérifier si l'email a été validé via le token de vérification
        $verificationData = Cache::get('verified_email_' . $request->email);
        
        if (!$verificationData || $verificationData['token'] !== $request->verification_token) {
            return response()->json([
                'message' => 'L\'adresse e-mail n\'a pas été vérifiée. Veuillez d\'abord vérifier votre e-mail.',
            ], 403);
        }

        // Créer le nouvel utilisateur
        $utilisateur = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(), // Marquer comme vérifié immédiatement
        ]);

        // Nettoyer le cache
        Cache::forget('verified_email_' . $request->email);

        // Créer automatiquement le profil par défaut "Moi-même"
        Profil::create([
            'user_id' => $utilisateur->id,
            'nom' => $utilisateur->name,
            'relation' => 'Lui-même',
        ]);

        // Générer un token Sanctum pour cet utilisateur
        $token = $utilisateur->createToken('token-homemed')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie. Bienvenue sur HomeMed Manager !',
            'utilisateur' => $utilisateur->load('profils'),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant.
     *
     * Vérifie les identifiants et retourne un token d'accès Sanctum.
     *
     * @param  LoginRequest  $request  Données validées de la connexion
     * @return JsonResponse Token d'accès ou erreur 401
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Vérifier si l'utilisateur existe
        $utilisateur = User::where('email', $request->email)->first();

        // Cas : Compte créé via Google sans mot de passe défini
        if ($utilisateur && $utilisateur->password === null && $utilisateur->google_id !== null) {
            return response()->json([
                'message' => 'Ce compte est lié à Google. Veuillez utiliser le bouton "Continuer avec Google" ou utiliser "Mot de passe oublié" pour créer un accès manuel.',
                'type' => 'social_account_required'
            ], 403);
        }

        // Vérifier les identifiants classiques
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Identifiants incorrects. Vérifiez votre e-mail et mot de passe.',
            ], 401);
        }

        // Récupérer l'utilisateur authentifié avec ses profils
        $utilisateur = User::where('email', $request->email)
            ->with('profils')
            ->first();

        // Générer un nouveau token Sanctum
        $token = $utilisateur->createToken('token-homemed')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'utilisateur' => $utilisateur,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Déconnexion de l'utilisateur.
     *
     * Révoque le token actuel pour invalider la session.
     *
     * @param  Request  $request  Requête authentifiée
     * @return JsonResponse Confirmation de déconnexion
     */
    public function logout(Request $request): JsonResponse
    {
        // Révoquer le token courant de l'utilisateur
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    /**
     * Récupérer les informations de l'utilisateur connecté.
     *
     * Retourne l'utilisateur avec ses profils.
     *
     * @param  Request  $request  Requête authentifiée
     * @return JsonResponse Données de l'utilisateur
     */
    public function moi(Request $request): JsonResponse
    {
        return response()->json([
            'utilisateur' => $request->user()->load('profils'),
        ]);
    }

    /**
     * Mettre à jour les informations de compte (Email, Nom, Mot de passe).
     */
    public function updateAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$user->id,
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password']) && ! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Compte mis à jour avec succès.',
            'utilisateur' => $user->load('profils'),
        ]);
    }

    /**
     * Envoyer un code de vérification par e-mail.
     */
    public function sendVerificationCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
        ], [
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
        ]);

        $email = $request->email;
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Stocker le code en cache pendant 10 minutes
        Cache::put('verification_code_' . $email, $code, now()->addMinutes(10));

        // Envoyer l'e-mail
        Mail::to($email)->send(new VerificationMail($code));

        return response()->json([
            'message' => 'Un code de vérification a été envoyé à votre adresse e-mail.',
        ]);
    }

    /**
     * Vérifier le code et retourner un token de validation temporaire.
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $cachedCode = Cache::get('verification_code_' . $request->email);

        if (!$cachedCode || $cachedCode !== $request->code) {
            return response()->json([
                'message' => 'Le code de vérification est incorrect ou a expiré.',
            ], 422);
        }

        // Générer un token temporaire pour prouver la vérification lors de l'inscription
        $token = Str::random(64);
        Cache::put('verified_email_' . $request->email, [
            'token' => $token,
            'verified_at' => now(),
        ], now()->addMinutes(30));

        // Supprimer le code après vérification réussie
        Cache::forget('verification_code_' . $request->email);

        return response()->json([
            'message' => 'E-mail vérifié avec succès.',
            'verification_token' => $token,
        ]);
    }

    /**
     * Envoyer un code de réinitialisation de mot de passe.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Aucun compte n\'est associé à cette adresse e-mail.',
        ]);

        $email = $request->email;
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Stocker le code en cache pendant 15 minutes
        Cache::put('password_reset_code_' . $email, $code, now()->addMinutes(15));

        // Envoyer l'e-mail
        Mail::to($email)->send(new \App\Mail\PasswordResetMail($code));

        return response()->json([
            'message' => 'Un code de réinitialisation a été envoyé à votre adresse e-mail.',
        ]);
    }

    /**
     * Réinitialiser le mot de passe avec le code reçu.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $cachedCode = Cache::get('password_reset_code_' . $request->email);

        if (!$cachedCode || $cachedCode !== $request->code) {
            return response()->json([
                'message' => 'Le code de réinitialisation est incorrect ou a expiré.',
            ], 422);
        }

        // Mettre à jour le mot de passe
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Nettoyer le cache
        Cache::forget('password_reset_code_' . $request->email);

        return response()->json([
            'message' => 'Votre mot de passe a été réinitialisé avec succès.',
        ]);
    }
}
