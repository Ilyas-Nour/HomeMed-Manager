<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Gestion des Utilisateurs';
    protected static ?string $navigationLabel = 'Utilisateurs';
    protected static ?string $modelLabel = 'Utilisateur';
    protected static ?int $navigationSort = 1;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->withCount(['profils', 'medicaments']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informations du Compte')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nom complet')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->label('Adresse email')
                            ->email()
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('role')
                            ->label('Rôle')
                            ->helperText('Admin : accès au panneau d\'administration. Utilisateur : accès normal.')
                            ->options([
                                'user'  => 'Utilisateur',
                                'admin' => 'Administrateur',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('password')
                            ->label('Nouveau mot de passe')
                            ->helperText('Laissez vide pour ne pas changer le mot de passe.')
                            ->password()
                            ->revealable()
                            ->dehydrated(fn ($state) => filled($state))
                            ->dehydrateStateUsing(fn ($state) => bcrypt($state))
                            ->maxLength(255),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nom')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\BadgeColumn::make('role')
                    ->label('Rôle')
                    ->colors([
                        'primary' => 'user',
                        'success' => 'admin',
                    ])
                    ->formatStateUsing(fn ($state) => $state === 'admin' ? 'Administrateur' : 'Utilisateur'),
                Tables\Columns\TextColumn::make('profils_count')
                    ->label('Profils')
                    ->counts('profils')
                    ->badge()
                    ->color('info')
                    ->sortable(),
                Tables\Columns\TextColumn::make('medicaments_count')
                    ->label('Médicaments')
                    ->counts('medicaments')
                    ->badge()
                    ->color('success')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Inscrit le')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->label('Filtrer par rôle')
                    ->options([
                        'user'  => 'Utilisateur',
                        'admin' => 'Administrateur',
                    ]),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')->label('Inscrit depuis'),
                        Forms\Components\DatePicker::make('created_until')->label('Inscrit jusqu\'au'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['created_from'], fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
                            ->when($data['created_until'], fn ($q, $date) => $q->whereDate('created_at', '<=', $date));
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Modifier'),
                Tables\Actions\Action::make('resetPassword')
                    ->label('Réinitialiser MDP')
                    ->icon('heroicon-o-key')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalHeading('Réinitialiser le mot de passe')
                    ->modalDescription('Un nouveau mot de passe temporaire "password123" sera défini. Informez l\'utilisateur.')
                    ->action(function (User $record) {
                        $record->update(['password' => bcrypt('password123')]);
                        \Filament\Notifications\Notification::make()
                            ->title('Mot de passe réinitialisé à "password123"')
                            ->success()->send();
                    }),
            ])
            ->bulkActions([
                // Intentionally limited — no bulk delete to avoid accidents
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
