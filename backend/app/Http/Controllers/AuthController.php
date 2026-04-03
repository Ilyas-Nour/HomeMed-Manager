<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Profil;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
     * @param RegisterRequest $request Données validées de l'inscription
     * @return JsonResponse Token d'accès + infos utilisateur
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Créer le nouvel utilisateur
        $utilisateur = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Créer automatiquement le profil par défaut "Moi-même"
        Profil::create([
            'user_id'  => $utilisateur->id,
            'nom'      => $utilisateur->name,
            'relation' => 'soi-même',
        ]);

        // Générer un token Sanctum pour cet utilisateur
        $token = $utilisateur->createToken('token-homemed')->plainTextToken;

        return response()->json([
            'message'      => 'Inscription réussie. Bienvenue sur HomeMed Manager !',
            'utilisateur'  => $utilisateur->load('profils'),
            'token'        => $token,
            'token_type'   => 'Bearer',
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant.
     *
     * Vérifie les identifiants et retourne un token d'accès Sanctum.
     *
     * @param LoginRequest $request Données validées de la connexion
     * @return JsonResponse Token d'accès ou erreur 401
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Vérifier les identifiants
        if (!Auth::attempt($request->only('email', 'password'))) {
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
            'message'     => 'Connexion réussie.',
            'utilisateur' => $utilisateur,
            'token'       => $token,
            'token_type'  => 'Bearer',
        ]);
    }

    /**
     * Déconnexion de l'utilisateur.
     *
     * Révoque le token actuel pour invalider la session.
     *
     * @param Request $request Requête authentifiée
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
     * @param Request $request Requête authentifiée
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
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password']) && !empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message'     => 'Compte mis à jour avec succès.',
            'utilisateur' => $user->load('profils'),
        ]);
    }
}
