<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RappelResource\Pages;
use App\Models\Rappel;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class RappelResource extends Resource
{
    protected static ?string $model = Rappel::class;
    protected static ?string $navigationIcon = 'heroicon-o-bell-alert';
    protected static ?string $navigationGroup = 'Inventaire & Suivi';
    protected static ?string $navigationLabel = 'Rappels';
    protected static ?string $modelLabel = 'Rappel';
    protected static ?int $navigationSort = 3;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['medicament.profil.user']);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('medicament_id')
                ->label('Médicament')
                ->relationship('medicament', 'nom')
                ->required(),
            Forms\Components\Select::make('moment')
                ->label('Moment de prise')
                ->options([
                    'Matin'     => 'Matin',
                    'Midi'      => 'Midi',
                    'Soir'      => 'Soir',
                    'Nuit'      => 'Nuit',
                    'Au besoin' => 'Au besoin',
                ])
                ->required(),
            Forms\Components\TimePicker::make('heure')
                ->label('Heure du rappel')
                ->seconds(false),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('medicament.nom')
                    ->label('Médicament')
                    ->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('medicament.profil.nom')
                    ->label('Patient')
                    ->searchable()->sortable(),
                Tables\Columns\TextColumn::make('medicament.profil.user.name')
                    ->label('Compte Utilisateur')
                    ->searchable()->toggleable(),
                Tables\Columns\BadgeColumn::make('moment')
                    ->label('Moment')
                    ->colors([
                        'warning' => 'Matin',
                        'info'    => 'Midi',
                        'primary' => 'Soir',
                        'gray'    => 'Nuit',
                    ]),
                Tables\Columns\TextColumn::make('heure')
                    ->label('Heure')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('moment')
                    ->label('Moment')
                    ->options([
                        'Matin'     => 'Matin',
                        'Midi'      => 'Midi',
                        'Soir'      => 'Soir',
                        'Nuit'      => 'Nuit',
                        'Au besoin' => 'Au besoin',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Modifier'),
            ])
            ->bulkActions([])
            ->defaultSort('heure');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListRappels::route('/'),
            'create' => Pages\CreateRappel::route('/create'),
            'edit'   => Pages\EditRappel::route('/{record}/edit'),
        ];
    }
}
