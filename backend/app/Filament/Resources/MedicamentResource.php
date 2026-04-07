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

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['profil']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('nom')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('type')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('quantite')
                    ->numeric()
                    ->required()
                    ->default(0),
                Forms\Components\TextInput::make('seuil_alerte')
                    ->numeric()
                    ->required()
                    ->default(5),
                Forms\Components\DatePicker::make('date_expiration'),
                Forms\Components\Select::make('profil_id')
                    ->relationship('profil', 'nom')
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
                Tables\Columns\TextColumn::make('type'),
                Tables\Columns\TextColumn::make('quantite')
                    ->sortable(),
                Tables\Columns\TextColumn::make('profil.nom')
                    ->label('Patient')
                    ->sortable(),
                Tables\Columns\IconColumn::make('stock_faible')
                    ->boolean()
                    ->label('Stock Faible'),
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
            'index' => Pages\ListMedicaments::route('/'),
            'create' => Pages\CreateMedicament::route('/create'),
            'edit' => Pages\EditMedicament::route('/{record}/edit'),
        ];
    }
}
