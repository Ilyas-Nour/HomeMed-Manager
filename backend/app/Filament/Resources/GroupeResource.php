<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GroupeResource\Pages;
use App\Models\Groupe;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class GroupeResource extends Resource
{
    protected static ?string $model = Groupe::class;
    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Gestion Administrative';
    protected static ?string $navigationLabel = 'Groupes';
    protected static ?string $modelLabel = 'Groupe';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['proprietaire']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('nom')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Select::make('proprietaire_id')
                    ->relationship('proprietaire', 'name')
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nom')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('proprietaire.name')
                    ->label('Propriétaire')
                    ->sortable(),
                Tables\Columns\TextColumn::make('participants_count')
                    ->counts('participants')
                    ->label('Membres'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListGroupes::route('/'),
            'create' => Pages\CreateGroupe::route('/create'),
            'edit' => Pages\EditGroupe::route('/{record}/edit'),
        ];
    }
}
