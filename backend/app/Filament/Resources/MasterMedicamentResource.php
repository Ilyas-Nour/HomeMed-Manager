<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MasterMedicamentResource\Pages;
use App\Models\MasterMedicament;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MasterMedicamentResource extends Resource
{
    protected static ?string $model = MasterMedicament::class;
    protected static ?string $navigationIcon = 'heroicon-o-archive-box';
    protected static ?string $navigationGroup = 'Configuration';
    protected static ?string $navigationLabel = 'Catalogue Médicaments';
    protected static ?string $modelLabel = 'Médicament du Catalogue';
    protected static ?string $pluralModelLabel = 'Catalogue des Médicaments';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informations du Médicament')
                    ->description('Ces médicaments apparaissent comme suggestions dans le formulaire d\'ajout.')
                    ->schema([
                        Forms\Components\TextInput::make('nom')
                            ->label('Nom du médicament')
                            ->helperText('Ex: Doliprane, Amoxicilline, Ibuprofène...')
                            ->required()->maxLength(255),
                        Forms\Components\Select::make('type')
                            ->label('Forme galénique')
                            ->options([
                                'Comprimé'    => 'Comprimé',
                                'Capsule'     => 'Capsule',
                                'Sirop'       => 'Sirop',
                                'Injection'   => 'Injection',
                                'Crème'       => 'Crème',
                                'Gouttes'     => 'Gouttes',
                                'Suppositoire'=> 'Suppositoire',
                                'Patch'       => 'Patch',
                                'Spray'       => 'Spray',
                                'Autre'       => 'Autre',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('dosage')
                            ->label('Dosage standard')
                            ->helperText('Ex: 500mg, 1g, 250mg/5ml...')
                            ->maxLength(100),
                        Forms\Components\Textarea::make('description')
                            ->label('Description / Usage commun')
                            ->helperText('Ex: Antalgique et antipyrétique. Utilisé contre la douleur et la fièvre.')
                            ->rows(2),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nom')
                    ->label('Nom')
                    ->searchable()->sortable()->weight('bold'),
                Tables\Columns\BadgeColumn::make('type')
                    ->label('Forme')
                    ->color('primary'),
                Tables\Columns\TextColumn::make('dosage')
                    ->label('Dosage')
                    ->default('—'),
                Tables\Columns\TextColumn::make('description')
                    ->label('Description')
                    ->limit(60)
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ajouté le')
                    ->date('d/m/Y')
                    ->sortable()->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Forme galénique')
                    ->options([
                        'Comprimé'    => 'Comprimé',
                        'Capsule'     => 'Capsule',
                        'Sirop'       => 'Sirop',
                        'Injection'   => 'Injection',
                        'Crème'       => 'Crème',
                        'Autre'       => 'Autre',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()->label('➕ Ajouter au catalogue'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Modifier'),
                Tables\Actions\DeleteAction::make()->label('Supprimer'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()->label('Supprimer la sélection'),
                ]),
            ])
            ->defaultSort('nom');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListMasterMedicaments::route('/'),
            'create' => Pages\CreateMasterMedicament::route('/create'),
            'edit'   => Pages\EditMasterMedicament::route('/{record}/edit'),
        ];
    }
}
