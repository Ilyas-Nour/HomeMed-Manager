<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AchatResource\Pages;
use App\Models\Achat;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class AchatResource extends Resource
{
    protected static ?string $model = Achat::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-cart';
    protected static ?string $navigationGroup = 'Inventaire & Suivi';
    protected static ?string $navigationLabel = 'Achats';
    protected static ?string $modelLabel = 'Achat';
    protected static ?int $navigationSort = 2;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['medicament', 'profil.user']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Détails de l\'Achat')
                    ->schema([
                        Forms\Components\Select::make('medicament_id')
                            ->label('Médicament existant')
                            ->relationship('medicament', 'nom')
                            ->searchable()
                            ->placeholder('Sélectionner un médicament existant'),
                        Forms\Components\TextInput::make('medicament_nom_temp')
                            ->label('Ou: Nom du médicament (nouveau)')
                            ->helperText('Utilisez ce champ si le médicament n\'est pas encore dans l\'inventaire.')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('pharmacie')
                            ->label('Pharmacie')
                            ->required()->maxLength(255),
                        Forms\Components\TextInput::make('prix')
                            ->label('Prix (MAD)')
                            ->numeric()->required()->prefix('MAD'),
                        Forms\Components\TextInput::make('quantite')
                            ->label('Quantité')
                            ->numeric()->required(),
                        Forms\Components\DatePicker::make('date_achat')
                            ->label('Date de l\'achat')
                            ->required()->default(now()),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('medicament.nom')
                    ->label('Médicament')
                    ->default(fn ($record) => $record->medicament_nom_temp ?? '—')
                    ->sortable()->searchable()->weight('bold'),
                Tables\Columns\TextColumn::make('pharmacie')
                    ->label('Pharmacie')
                    ->searchable(),
                Tables\Columns\TextColumn::make('profil.user.name')
                    ->label('Utilisateur')
                    ->sortable()->searchable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('prix')
                    ->label('Prix')
                    ->money('MAD')->sortable(),
                Tables\Columns\TextColumn::make('quantite')
                    ->label('Qté'),
                Tables\Columns\BadgeColumn::make('statut')
                    ->label('Statut')
                    ->colors([
                        'success' => 'completed',
                        'warning' => 'pending',
                    ])
                    ->formatStateUsing(fn ($state) => $state === 'completed' ? 'Acheté' : 'Planifié'),
                Tables\Columns\TextColumn::make('date_achat')
                    ->label('Date')
                    ->date('d/m/Y')->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('statut')
                    ->label('Statut')
                    ->options([
                        'pending'   => 'Planifié',
                        'completed' => 'Acheté',
                    ]),
                Tables\Filters\Filter::make('date_achat_range')
                    ->form([
                        Forms\Components\DatePicker::make('from')->label('Du'),
                        Forms\Components\DatePicker::make('until')->label('Au'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'], fn ($q, $date) => $q->whereDate('date_achat', '>=', $date))
                            ->when($data['until'], fn ($q, $date) => $q->whereDate('date_achat', '<=', $date));
                    }),
                Tables\Filters\Filter::make('prix_range')
                    ->form([
                        Forms\Components\TextInput::make('prix_min')->label('Prix min (MAD)')->numeric(),
                        Forms\Components\TextInput::make('prix_max')->label('Prix max (MAD)')->numeric(),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['prix_min'], fn ($q, $val) => $q->where('prix', '>=', $val))
                            ->when($data['prix_max'], fn ($q, $val) => $q->where('prix', '<=', $val));
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
            ->defaultSort('date_achat', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListAchats::route('/'),
            'create' => Pages\CreateAchat::route('/create'),
            'edit'   => Pages\EditAchat::route('/{record}/edit'),
        ];
    }
}
