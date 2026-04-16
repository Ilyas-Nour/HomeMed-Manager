<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MedicamentResource\Pages;
use App\Models\Medicament;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class MedicamentResource extends Resource
{
    protected static ?string $model = Medicament::class;
    protected static ?string $navigationIcon = 'heroicon-o-beaker';
    protected static ?string $navigationGroup = 'Inventaire & Suivi';
    protected static ?string $navigationLabel = 'Médicaments';
    protected static ?string $modelLabel = 'Médicament';
    protected static ?int $navigationSort = 1;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['profil.user']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informations du Médicament')
                    ->schema([
                        Forms\Components\TextInput::make('nom')
                            ->label('Nom du médicament')
                            ->required()->maxLength(255),
                        Forms\Components\TextInput::make('type')
                            ->label('Type / Forme')
                            ->required()->maxLength(255),
                        Forms\Components\TextInput::make('dosage')
                            ->label('Dosage')->maxLength(255),
                        Forms\Components\Textarea::make('posologie')
                            ->label('Posologie / Instructions')
                            ->rows(3),
                        Forms\Components\Select::make('profil_id')
                            ->label('Profil Patient')
                            ->relationship('profil', 'nom')
                            ->searchable()
                            ->required(),
                    ])->columns(2),

                Forms\Components\Section::make('Stock & Dates')
                    ->schema([
                        Forms\Components\TextInput::make('quantite')
                            ->label('Quantité en stock')
                            ->numeric()->required()->default(0),
                        Forms\Components\TextInput::make('seuil_alerte')
                            ->label('Seuil d\'alerte stock')
                            ->helperText('Une alerte sera déclenchée si le stock passe sous ce seuil.')
                            ->numeric()->required()->default(5),
                        Forms\Components\DatePicker::make('date_expiration')
                            ->label('Date d\'expiration'),
                        Forms\Components\DatePicker::make('date_debut')
                            ->label('Début du traitement'),
                        Forms\Components\DatePicker::make('date_fin')
                            ->label('Fin prévue du traitement'),
                    ])->columns(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nom')
                    ->label('Médicament')
                    ->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()->color('info'),
                Tables\Columns\TextColumn::make('profil.nom')
                    ->label('Patient')
                    ->sortable()->searchable(),
                Tables\Columns\TextColumn::make('profil.user.name')
                    ->label('Compte Utilisateur')
                    ->sortable()->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('quantite')
                    ->label('Stock')
                    ->sortable()
                    ->color(fn ($record) => $record->quantite <= $record->seuil_alerte ? 'danger' : 'success'),
                Tables\Columns\TextColumn::make('date_expiration')
                    ->label('Expiration')
                    ->date('d/m/Y')
                    ->sortable()
                    ->color(fn ($record) => $record->date_expiration && \Carbon\Carbon::parse($record->date_expiration)->isPast() ? 'danger' : null),
            ])
            ->filters([
                Tables\Filters\Filter::make('stock_critique')
                    ->label('⚠️ Stock Critique Seulement')
                    ->query(fn (Builder $query) => $query->whereColumn('quantite', '<=', 'seuil_alerte')),
                Tables\Filters\Filter::make('expire_bientot')
                    ->label('📅 Expire dans 30 jours')
                    ->query(fn (Builder $query) => $query->whereNotNull('date_expiration')
                        ->whereDate('date_expiration', '<=', now()->addDays(30))
                        ->whereDate('date_expiration', '>=', now())
                    ),
                Tables\Filters\Filter::make('expiration_range')
                    ->form([
                        Forms\Components\DatePicker::make('expire_from')->label('Expiration depuis'),
                        Forms\Components\DatePicker::make('expire_until')->label('Expiration jusqu\'au'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['expire_from'], fn ($q, $date) => $q->whereDate('date_expiration', '>=', $date))
                            ->when($data['expire_until'], fn ($q, $date) => $q->whereDate('date_expiration', '<=', $date));
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Modifier'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()->label('Supprimer la sélection'),
                ]),
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
            'index'  => Pages\ListMedicaments::route('/'),
            'create' => Pages\CreateMedicament::route('/create'),
            'edit'   => Pages\EditMedicament::route('/{record}/edit'),
        ];
    }
}
