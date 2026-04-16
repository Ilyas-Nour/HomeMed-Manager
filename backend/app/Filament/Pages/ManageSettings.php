<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

class ManageSettings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationLabel = 'Paramètres';
    protected static ?string $title = 'Paramètres de l\'Application';
    protected static ?string $navigationGroup = 'Configuration';
    protected static ?int $navigationSort = 1;

    protected static string $view = 'filament.pages.manage-settings';

    public array $data = [];

    public function mount(): void
    {
        $keys = [
            'ai_api_key', 'ai_model', 'ai_enabled', 'ai_system_prompt',
            'app_name', 'support_email', 'support_phone',
            'registration_enabled', 'maintenance_mode',
            'shared_pharmacy_enabled', 'collaboration_enabled', 'max_profiles_per_user',
        ];

        foreach ($keys as $key) {
            $setting = Setting::where('key', $key)->first();
            $val = $setting?->value ?? '';
            
            // Convert 'true'/'false' strings to boolean for Toggle components
            if ($val === 'true') $val = true;
            if ($val === 'false') $val = false;
            
            $this->data[$key] = $val;
        }
    }

    public function form(Form $form): Form
    {
        return $form
            ->statePath('data')
            ->schema([

                // =====================================================
                // SECTION: AI Configuration
                // =====================================================
                Forms\Components\Section::make('🤖 Configuration de l\'Intelligence Artificielle')
                    ->description('Paramètres du chatbot pharmacien intégré à l\'application.')
                    ->collapsible()
                    ->schema([
                        Forms\Components\Toggle::make('ai_enabled')
                            ->label('Activer le Chatbot IA')
                            ->helperText('Désactivez pour masquer complètement le chatbot pour tous les utilisateurs.')
                            ->default(true)
                            ->inline(false),

                        Forms\Components\TextInput::make('ai_api_key')
                            ->label('Clé API OpenRouter')
                            ->helperText('Obtenez votre clé gratuite sur openrouter.ai → Compte → API Keys')
                            ->password()
                            ->revealable()
                            ->placeholder('sk-or-v1-...')
                            ->maxLength(500),

                        Forms\Components\Select::make('ai_model')
                            ->label('Modèle IA')
                            ->helperText('GPT-3.5 est économique. GPT-4o est plus intelligent mais plus coûteux.')
                            ->options([
                                'openai/gpt-3.5-turbo'       => 'GPT-3.5 Turbo (Rapide & Économique)',
                                'openai/gpt-4o'              => 'GPT-4o (Intelligent & Précis)',
                                'openai/gpt-4o-mini'         => 'GPT-4o Mini (Équilibre)',
                                'google/gemini-flash-1.5'    => 'Google Gemini Flash 1.5',
                                'google/gemini-pro-1.5'      => 'Google Gemini Pro 1.5',
                                'meta-llama/llama-3.1-8b-instruct' => 'Meta Llama 3.1 (Gratuit)',
                            ])
                            ->searchable()
                            ->default('openai/gpt-3.5-turbo'),

                        Forms\Components\Textarea::make('ai_system_prompt')
                            ->label('Instructions du Chatbot')
                            ->helperText('Définissez comment le chatbot se comporte. Écrivez en français pour des réponses françaises.')
                            ->rows(5)
                            ->maxLength(5000),
                    ]),

                // =====================================================
                // SECTION: Branding & Contact
                // =====================================================
                Forms\Components\Section::make('🏷️ Identité & Contact')
                    ->description('Nom de l\'application et informations de contact affichées aux utilisateurs.')
                    ->collapsible()
                    ->schema([
                        Forms\Components\TextInput::make('app_name')
                            ->label('Nom de l\'Application')
                            ->helperText('Ce nom apparaît dans le titre de l\'onglet du navigateur.')
                            ->maxLength(100)
                            ->required(),

                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\TextInput::make('support_email')
                                ->label('Email de Support')
                                ->helperText('Email auquel les utilisateurs peuvent vous contacter.')
                                ->email()
                                ->maxLength(255),

                            Forms\Components\TextInput::make('support_phone')
                                ->label('Téléphone de Support')
                                ->helperText('Numéro affiché dans l\'application pour le support.')
                                ->tel()
                                ->maxLength(20),
                        ]),
                    ]),

                // =====================================================
                // SECTION: Feature Flags
                // =====================================================
                Forms\Components\Section::make('⚙️ Fonctionnalités')
                    ->description('Activez ou désactivez les modules de l\'application.')
                    ->collapsible()
                    ->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\Toggle::make('registration_enabled')
                                ->label('Inscription Ouverte')
                                ->helperText('Si désactivé, personne ne peut créer de nouveau compte.')
                                ->inline(false),

                            Forms\Components\Toggle::make('maintenance_mode')
                                ->label('Mode Maintenance')
                                ->helperText('⚠️ Si activé, tous les utilisateurs verront un message de maintenance.')
                                ->inline(false),

                            Forms\Components\Toggle::make('shared_pharmacy_enabled')
                                ->label('Pharmacie Partagée (Entraide)')
                                ->helperText('Permet le partage de médicaments entre utilisateurs.')
                                ->inline(false),

                            Forms\Components\Toggle::make('collaboration_enabled')
                                ->label('Collaboration & Chat')
                                ->helperText('Permet la collaboration et la messagerie entre utilisateurs.')
                                ->inline(false),
                        ]),

                        Forms\Components\TextInput::make('max_profiles_per_user')
                            ->label('Nombre Max. de Profils par Utilisateur')
                            ->helperText('Limite le nombre de membres de la famille qu\'un utilisateur peut ajouter.')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(50)
                            ->default(10),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? 'true' : 'false') : (string) ($value ?? '')]
            );
            Cache::forget("setting_{$key}");
        }

        Notification::make()
            ->title('Paramètres sauvegardés avec succès')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Sauvegarder les Paramètres')
                ->submit('save'),
        ];
    }
}
