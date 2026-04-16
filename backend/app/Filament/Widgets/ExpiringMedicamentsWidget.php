<?php

namespace App\Filament\Widgets;

use App\Models\Medicament;
use Carbon\Carbon;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class ExpiringMedicamentsWidget extends BaseWidget
{
    protected static ?string $heading = '⚠️ Médicaments Expirant dans 30 Jours';
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Medicament::query()
                    ->with(['profil.user'])
                    ->whereNotNull('date_expiration')
                    ->whereDate('date_expiration', '<=', Carbon::now()->addDays(30))
                    ->whereDate('date_expiration', '>=', Carbon::now())
                    ->orderBy('date_expiration')
            )
            ->columns([
                Tables\Columns\TextColumn::make('nom')
                    ->label('Médicament')
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('profil.nom')
                    ->label('Patient'),
                Tables\Columns\TextColumn::make('profil.user.name')
                    ->label('Utilisateur'),
                Tables\Columns\TextColumn::make('date_expiration')
                    ->label('Expiration')
                    ->date('d/m/Y')
                    ->color(fn ($record) => Carbon::parse($record->date_expiration)->diffInDays(now()) <= 7 ? 'danger' : 'warning'),
                Tables\Columns\TextColumn::make('jours_restants')
                    ->label('Jours restants')
                    ->getStateUsing(fn ($record) => Carbon::now()->diffInDays($record->date_expiration) . ' jours')
                    ->badge()
                    ->color(fn ($record) => Carbon::parse($record->date_expiration)->diffInDays(now()) <= 7 ? 'danger' : 'warning'),
            ]);
    }
}
