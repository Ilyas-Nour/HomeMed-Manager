<?php

namespace App\Http\Controllers;

use App\Models\Medicament;
use App\Models\Profil;
use App\Models\Rappel;
use App\Models\User;
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

            return $response->json();
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

        return $context;
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

CONTEXTE DE L'UTILISATEUR (NE JAMAIS MENTIONNER D'AUTRES UTILISATEURS) :
$contextJson

DIRECTIVES :
1. Personnalisation : Adresse-toi à l'utilisateur par son nom ({$context['owner_name']}) si approprié.
2. Famille : Quand tu parles des médicaments, précise pour quel membre de la famille (profil) ils sont destinés.
3. Rappels : Utilise le planning pour dire ce qui a été pris ou ce qui reste à prendre aujourd'hui.
4. Stock : Alerte l'utilisateur si le stock d'un médicament est bas.
5. Expertise Marocaine : Continue de proposer des équivalents locaux et DCIs disponibles au Maroc (Laprophan, Sothema, etc.).
6. Confidentialité : Ne partage JAMAIS d'informations qui ne sont pas dans ce contexte.
7. Ne sois pas uniquement un bot qui renvoie vers un médecin. Donne des conseils concrets basés sur les pratiques pharmaceutiques.
8. Langue : Réponds toujours dans la langue utilisée par l'utilisateur pour poser la question (ex: Français, Arabe/Darija, Anglais, etc.), sauf si l'utilisateur demande explicitement une autre langue.";
    }
}
