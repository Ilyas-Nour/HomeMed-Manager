<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Groupe;
use App\Models\User;
use App\Models\GroupInvitation;
use App\Mail\GroupInvitation as GroupInvitationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class GroupeController extends Controller
{
    /**
     * Liste des groupes de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        $groupes = $request->user()->participatedGroups()
            ->with([
                'participants:id,name,email',
                'invitations',
                'participants.profils.medicaments'
            ])
            ->get();

        // Enrich each group with a flat list of shared medications
        $groupes->each(function ($groupe) {
            $medicamentsPartages = collect();
            foreach ($groupe->participants as $participant) {
                foreach ($participant->profils as $profil) {
                    foreach ($profil->medicaments as $med) {
                        $medicamentsPartages->push([
                            'id'            => $med->id,
                            'nom'           => $med->nom,
                            'type'          => $med->type,
                            'quantite'      => $med->quantite,
                            'seuil_alerte'  => $med->seuil_alerte,
                            'date_expiration' => $med->date_expiration,
                            'profil_nom'    => $profil->nom . ' (' . $participant->name . ')',
                        ]);
                    }
                }
            }
            $groupe->medicaments_partages = $medicamentsPartages->values();
        });

        return response()->json($groupes);
    }

    /**
     * Création d'un groupe.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
        ]);

        $groupe = Groupe::create([
            'nom' => $validated['nom'],
            'proprietaire_id' => $request->user()->id,
        ]);

        // Attacher le propriétaire en tant que rôle 'proprietaire'
        $groupe->participants()->attach($request->user()->id, ['role' => 'proprietaire']);

        ActivityLog::log('GROUP_ADD', "Groupe créé : {$groupe->nom}");

        return response()->json($groupe->load('participants:id,name,email'), 201);
    }

    /**
     * Afficher un groupe et ses profils partagés.
     */
    public function show(Request $request, $id)
    {
        $groupe = $request->user()->participatedGroups()->with('participants.profils.medicaments')->findOrFail($id);
        return response()->json($groupe);
    }

    /**
     * Inviter un utilisateur par e-mail (Envoi d'un e-mail réel).
     */
    public function addUser(Request $request, $id)
    {
        $groupe = $request->user()->participatedGroups()->wherePivot('role', 'proprietaire')->findOrFail($id);

        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = $validated['email'];
        $existingUser = User::where('email', $email)->first();

        if ($existingUser && $existingUser->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas vous inviter vous-même'], 400);
        }

        if ($groupe->participants()->where('users.email', $email)->exists()) {
            return response()->json(['message' => 'Cet utilisateur est déjà membre du groupe'], 400);
        }

        // Création de l'invitation
        $token = Str::random(64);
        GroupInvitation::updateOrCreate(
            ['groupe_id' => $groupe->id, 'email' => $email],
            [
                'token' => $token,
                'statut' => 'en_attente',
                'expires_at' => now()->addDays(7)
            ]
        );

        // Envoi de l'e-mail réel (si l'utilisateur autorise les alertes par email)
        try {
            $shouldSend = true;
            if ($existingUser) {
                $prefs = $existingUser->notificationPreference; // Laravel relationship (needs update in User model)
                if ($prefs && !$prefs->email_alerts) {
                    $shouldSend = false;
                }
            }

            if ($shouldSend) {
                Mail::to($email)->send(new GroupInvitationMail($groupe, $token, !!$existingUser));
                ActivityLog::log('GROUP_INVITE_SENT', "Invitation envoyée à {$email} pour le groupe {$groupe->nom}");
            } else {
                ActivityLog::log('GROUP_INVITE_SILENT', "Invitation enregistrée pour {$email} (Envoi email désactivé par l'utilisateur)");
            }
        } catch (\Exception $e) {
            return response()->json(['message' => "L'invitation a été enregistrée mais l'e-mail n'a pas pu être envoyé.", 'error' => $e->getMessage()], 500);
        }

        return response()->json([
            'message' => 'Invitation envoyée avec succès par e-mail.',
            'invitation_token' => (app()->environment('local')) ? $token : null
        ]);
    }

    /**
     * Accepter une invitation par token.
     */
    public function acceptInvite(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string|size:64',
        ]);

        $invitation = GroupInvitation::where('token', $validated['token'])
            ->where('statut', 'en_attente')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $groupe = $invitation->groupe;

        // On attache l'utilisateur connecté
        $groupe->participants()->syncWithoutDetaching([
            $request->user()->id => ['role' => $invitation->role]
        ]);

        // On marque comme accepté
        $invitation->update(['statut' => 'accepte']);
        
        ActivityLog::log('GROUP_MEMBER_JOIN', "Utilisateur a rejoint le groupe {$groupe->nom} via invitation.");

        return response()->json(['message' => 'Vous avez rejoint le groupe avec succès !', 'groupe_id' => $groupe->id]);
    }

    /**
     * Supprimer un groupe.
     */
    public function destroy(Request $request, $id)
    {
        $groupe = $request->user()->participatedGroups()->wherePivot('role', 'proprietaire')->findOrFail($id);
        $nom = $groupe->nom;
        $groupe->delete();

        ActivityLog::log('GROUP_DELETE', "Groupe supprimé : {$nom}");

        return response()->json(['message' => 'Groupe supprimé avec succès.']);
    }
}
