<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // --- AI Configuration ---
            [
                'key'         => 'ai_api_key',
                'value'       => '',
                'type'        => 'string',
                'group'       => 'ai',
                'description' => 'Clé API OpenRouter. Obtenez-la sur openrouter.ai',
                'is_secret'   => true,
            ],
            [
                'key'         => 'ai_model',
                'value'       => 'openai/gpt-3.5-turbo',
                'type'        => 'string',
                'group'       => 'ai',
                'description' => 'Modèle IA utilisé par le chatbot pharmacien. Ex: openai/gpt-4o, google/gemini-flash-1.5',
                'is_secret'   => false,
            ],
            [
                'key'         => 'ai_enabled',
                'value'       => 'true',
                'type'        => 'boolean',
                'group'       => 'ai',
                'description' => 'Activer ou désactiver le chatbot IA pour tous les utilisateurs.',
                'is_secret'   => false,
            ],
            [
                'key'         => 'ai_system_prompt',
                'value'       => 'Tu es "HomeMed Pharmacien Expert", un assistant spécialisé dans le marché pharmaceutique Marocain. Ta mission est d\'agir avec l\'expertise d\'un pharmacien d\'officine au Maroc.',
                'type'        => 'text',
                'group'       => 'ai',
                'description' => 'Instructions de base pour le comportement du chatbot IA.',
                'is_secret'   => false,
            ],

            // --- Branding & Contact ---
            [
                'key'         => 'app_name',
                'value'       => 'HomeMed Manager',
                'type'        => 'string',
                'group'       => 'branding',
                'description' => 'Nom de l\'application affiché dans l\'interface utilisateur.',
                'is_secret'   => false,
            ],
            [
                'key'         => 'support_email',
                'value'       => '',
                'type'        => 'string',
                'group'       => 'branding',
                'description' => 'Adresse email du support client. Affichée dans l\'application.',
                'is_secret'   => false,
            ],
            [
                'key'         => 'support_phone',
                'value'       => '',
                'type'        => 'string',
                'group'       => 'branding',
                'description' => 'Numéro de téléphone du support. Affiché aux utilisateurs.',
                'is_secret'   => false,
            ],

            // --- Feature Flags ---
            [
                'key'         => 'registration_enabled',
                'value'       => 'true',
                'type'        => 'boolean',
                'group'       => 'features',
                'description' => 'Permettre aux nouveaux utilisateurs de créer un compte. Désactivez pour une plateforme privée.',
                'is_secret'   => false,
            ],
            [
                'key'         => 'maintenance_mode',
                'value'       => 'false',
                'type'        => 'boolean',
                'group'       => 'features',
                'description' => 'Mettre l\'application en maintenance. Les utilisateurs verront un message d\'indisponibilité.',
                'is_secret'   => false,
            ],
            [
                'key'         => 'shared_pharmacy_enabled',
                'value'       => 'true',
                'type'        => 'boolean',
                'group'       => 'features',
                'description' => 'Activer ou désactiver le module Pharmacie Partagée (Entraide).',
                'is_secret'   => false,
            ],
            [
                'key'         => 'collaboration_enabled',
                'value'       => 'true',
                'type'        => 'boolean',
                'group'       => 'features',
                'description' => 'Activer ou désactiver le module de collaboration entre utilisateurs.',
                'is_secret'   => false,
            ],
            [
                'key'         => 'max_profiles_per_user',
                'value'       => '10',
                'type'        => 'integer',
                'group'       => 'features',
                'description' => 'Nombre maximum de profils qu\'un utilisateur peut créer (membres de la famille).',
                'is_secret'   => false,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
