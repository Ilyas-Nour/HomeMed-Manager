<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AchatResource\Pages;
use App\Filament\Resources\AchatResource\RelationManagers;
use App\Models\Achat;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AchatResource extends Resource
{
    protected static ?string $model = Achat::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['medicament']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('medicament_id')
                    ->relationship('medicament', 'nom')
                    ->required(),
                Forms\Components\TextInput::make('pharmacie')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('prix')
                    ->numeric()
                    ->required()
                    ->prefix('MAD'),
                Forms\Components\TextInput::make('quantite')
                    ->numeric()
                    ->required(),
                Forms\Components\DatePicker::make('date_achat')
                    ->required()
                    ->default(now()),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('medicament.nom')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('pharmacie')
                    ->searchable(),
                Tables\Columns\TextColumn::make('prix')
                    ->money('MAD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('quantite'),
                Tables\Columns\TextColumn::make('date_achat')
                    ->date()
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
            'index' => Pages\ListAchats::route('/'),
            'create' => Pages\CreateAchat::route('/create'),
            'edit' => Pages\EditAchat::route('/{record}/edit'),
        ];
    }
}
