<?php

namespace App\Http\Controllers;

use App\Models\Medicament;
use App\Models\Profil;
use App\Models\Rappel;
use App\Models\User;
use App\Models\MedicamentRequest;
use App\Models\SharingMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class AIChatController extends Controller
{
    /**
     * Main chat entry point.
     * Gather context, build prompt, and call OpenRouter.
     */
    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
        ]);

        $user = $request->user();
        $context = $this->getContextSummary($user);
        
        $apiKey = env('OPENROUTER_API_KEY');
        if (!$apiKey) {
            return response()->json(['message' => 'AI Service unavailable (Missing API Key)'], 500);
        }

        $systemPrompt = $this->buildSystemPrompt($context);

        $messages = $request->input('messages');
        
        // Ensure system prompt is at the start
        array_unshift($messages, [
            'role' => 'system',
            'content' => $systemPrompt
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url'),
                'X-Title' => 'HomeMed Manager',
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'openai/gpt-3.5-turbo',
                'messages' => $messages,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'message' => 'OpenRouter API Error',
                    'details' => $response->json()
                ], $response->status());
            }

            $aiData = $response->json();
            $text = $aiData['choices'][0]['message']['content'] ?? '';

            // --- Interception d'Action ---
            if (preg_match('/\[ACTION:\s*(.*?)\]/s', $text, $matches)) {
                $actionJson = $matches[1];
                $action = json_decode($actionJson, true);
                if ($action) {
                    try {
                        $this->handleAiAction($user, $action);
                    } catch (\Exception $e) {
                        \Log::error("AI Action Failed: " . $e->getMessage());
                    }
                }
                // Nettoyer la réponse pour l'utilisateur
                $cleanText = preg_replace('/\[ACTION:\s*(.*?)\]/s', '', $text);
                $aiData['choices'][0]['message']['content'] = trim($cleanText);
            }

            return response()->json($aiData);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Chat error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Gather all relevant database information for the user and their family.
     */
    private function getContextSummary(User $user)
    {
        $profils = $user->profils()->with(['medicaments' => function($q) {
            $q->with(['rappels' => function($r) {
                $r->with(['prises' => function($p) {
                    $p->whereDate('date_prise', Carbon::today());
                }]);
            }]);
        }])->get();

        $context = [
            'owner_name' => $user->name,
            'current_date' => Carbon::now()->format('Y-m-d H:i'),
            'family_profiles' => [],
        ];

        foreach ($profils as $profil) {
            $pData = [
                'name' => $profil->nom,
                'relation' => $profil->relation,
                'medications' => [],
            ];

            foreach ($profil->medicaments as $med) {
                $mData = [
                    'name' => $med->nom,
                    'dosage' => $med->dosage,
                    'stock' => $med->quantite_restante,
                    'expiry' => $med->date_expiration,
                    'reminders' => [],
                ];

                foreach ($med->rappels as $rappel) {
                    $prise = $rappel->prises->first();
                    $mData['reminders'][] = [
                        'time' => $rappel->heure,
                        'moment' => $rappel->moment,
                        'taken_today' => $prise ? (bool)$prise->pris : false,
                    ];
                }

                $pData['medications'][] = $mData;
            }

            $context['family_profiles'][] = $pData;
        }

        // --- Context : Partage & Messages ---
        $unreadMessages = SharingMessage::whereHas('request', function($q) use ($user) {
            $q->where('owner_id', $user->id)->orWhere('requester_id', $user->id);
        })->where('sender_id', '!=', $user->id)
          ->where('is_read', false)
          ->with(['sender', 'request.medicament'])
          ->get();

        $activeRequests = MedicamentRequest::where(function($q) use ($user) {
            $q->where('owner_id', $user->id)->orWhere('requester_id', $user->id);
        })->with(['medicament', 'requester', 'owner'])
          ->where('status', 'pending')
          ->get();

        $context['activity_feed'] = [
            'unread_messages' => $unreadMessages->map(fn($m) => [
                'from' => $m->sender->name,
                'medication' => $m->request->medicament->nom,
                'content_preview' => substr($m->content, 0, 50) . '...'
            ]),
            'pending_requests_count' => $activeRequests->count(),
            'pending_requests_details' => $activeRequests->map(fn($r) => [
                'type' => $r->owner_id == $user->id ? 'Reçue de' : 'Envoyée à',
                'person' => $r->owner_id == $user->id ? $r->requester->name : $r->owner->name,
                'medication' => $r->medicament->nom
            ]),
        ];

        return $context;
    }

    /**
     * Execute an action requested by the AI.
     */
    private function handleAiAction(User $user, array $action)
    {
        $type = $action['type'] ?? '';
        $data = $action['data'] ?? [];

        switch ($type) {
            case 'UPDATE_PROFILE':
                if (isset($data['name'])) {
                    $user->update(['name' => $data['name']]);
                }
                break;

            case 'UPDATE_MEDICAMENT':
                $medId = $data['id'] ?? null;
                if ($medId) {
                    $med = Medicament::where('id', $medId)
                        ->whereHas('profil', fn($q) => $q->where('user_id', $user->id))
                        ->first();
                    if ($med) {
                        $updateData = [];
                        if (isset($data['quantite'])) $updateData['quantite_restante'] = $data['quantite'];
                        if (isset($data['nom'])) $updateData['nom'] = $data['nom'];
                        if (isset($data['dosage'])) $updateData['dosage'] = $data['dosage'];
                        if (isset($data['expiration'])) $updateData['date_expiration'] = $data['expiration'];
                        $med->update($updateData);
                    }
                }
                break;

            case 'HANDLE_REQUEST':
                $requestId = $data['id'] ?? null;
                $status = $data['status'] ?? '';
                if ($requestId && in_array($status, ['accepted', 'rejected'])) {
                    $req = MedicamentRequest::where('id', $requestId)
                        ->where('owner_id', $user->id)
                        ->first();
                    if ($req) {
                        $req->update(['status' => $status]);
                    }
                }
                break;
        }
    }

    /**
     * Build the system prompt with injected context.
     */
    private function buildSystemPrompt(array $context)
    {
        $contextJson = json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return "Tu es \"HomeMed Pharmacien Expert\", un assistant spécialisé dans le marché pharmaceutique Marocain.
Ta mission est d'agir avec l'expertise d'un pharmacien d'officine au Maroc.

IMPORTANT : Tu as accès aux données réelles de l'utilisateur (Context ci-dessous). Utilise ces données pour donner des réponses personnalisées et des rappels précis.

CAPACITÉS D'ACTION (POUVOIR RÉEL) :
Tu peux modifier les données de l'utilisateur. Pour déclencher une action, ajoute ce tag à la fin de ton message :
[ACTION: {\"type\": \"TYPE_ACTION\", \"data\": { ... }}]

Types d'actions supportés :
1. UPDATE_PROFILE : Changer le nom. Data: {\"name\": \"Nouveau Nom\"}
2. UPDATE_MEDICAMENT : Modifier un médoc (stock, nom, dosage). Data: {\"id\": ID_MED, \"quantite\": NOMBRE, \"nom\": \"NOM\", \"dosage\": \"DOSAGE\"}
3. HANDLE_REQUEST : Gérer les demandes. Data: {\"id\": ID_REQ, \"status\": \"accepted\" | \"rejected\"}

Règles :
- Action uniquement si demandée explicitement ou logiquement nécessaire.
- JAMAIS de changement de mot de passe.
- Confirme toujours l'action en texte dans la réponse.

CONTEXTE DE L'UTILISATEUR (NE JAMAIS MENTIONNER D'AUTRES UTILISATEURS) :
$contextJson

DIRECTIVES PRIORITAIRES :
1. Langue (CRITIQUE) : Détecte la langue de l'utilisateur et réponds EXCLUSIVEMENT dans cette même langue. If the user asks in English, you MUST answer in English. Si l'utilisateur pose une question en Arabe/Darija, tu DOIS répondre en Arabe/Darija. Ne réponds en Français que si la question est en Français.
2. Personnalisation : Adresse-toi à l'utilisateur par son nom ({$context['owner_name']}) si approprié.
3. Famille : Précise pour quel membre de la famille (profil) les médicaments sont destinés.
4. Rappels : Utilise le planning pour dire ce qui a été pris ou ce qui reste à prendre aujourd'hui.
5. Stock : Alerte l'utilisateur si le stock d'un médicament est bas (quantité proche de zéro).
6. Partage & Messages : Informe l'utilisateur s'il a des messages non lus ou des demandes de médicaments en attente basées sur la section 'activity_feed' du contexte.
7. Expertise Marocaine : Continue de proposer des équivalents locaux et DCIs disponibles au Maroc (Laprophan, Sothema, etc.).
8. Confidentialité : Ne partage JAMAIS d'informations qui ne sont pas dans ce contexte.
9. Conseils : Ne sois pas uniquement un bot qui renvoie vers un médecin. Donne des conseils concrets basés sur les pratiques pharmaceutiques.";
    }
}
