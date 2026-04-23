<?php

namespace App\Http\Controllers;

use App\Models\Profil;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirige l'utilisateur vers la page d'authentification de Google.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Gère le retour de Google après l'authentification.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Chercher l'utilisateur par son google_id
            $user = User::where('google_id', $googleUser->id)->first();

            if (!$user) {
                // Si pas de google_id, chercher par email
                $user = User::where('email', $googleUser->email)->first();

                if ($user) {
                    // Si l'email existe, lier le compte Google
                    $user->update([
                        'google_id' => $googleUser->id,
                        'avatar' => $googleUser->avatar,
                    ]);
                } else {
                    // Créer un nouvel utilisateur
                    $user = User::create([
                        'name' => $googleUser->name,
                        'email' => $googleUser->email,
                        'google_id' => $googleUser->id,
                        'avatar' => $googleUser->avatar,
                        'password' => null, // Pas de mot de passe pour les comptes sociaux
                        'email_verified_at' => now(),
                    ]);

                    // Créer automatiquement le profil par défaut
                    Profil::create([
                        'user_id' => $user->id,
                        'nom' => $user->name,
                        'relation' => 'Lui-même',
                        'photo' => $googleUser->avatar,
                    ]);
                }
            }

            // Mettre à jour l'avatar et la photo du profil "Lui-même" à chaque connexion
            $user->update(['avatar' => $googleUser->avatar]);
            $user->profils()->where('relation', 'Lui-même')->update(['photo' => $googleUser->avatar]);

            // Connecter l'utilisateur et générer un token
            Auth::login($user);
            $token = $user->createToken('token-homemed')->plainTextToken;

            // Rediriger vers le frontend avec le token
            // On utilise un paramètre de requête pour transmettre le token au frontend
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect($frontendUrl . '/auth/callback?token=' . $token);

        } catch (Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?error=google_auth_failed');
        }
    }
}
