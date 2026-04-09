<?php

namespace App\Filament\Widgets;

use App\Models\Achat;
use App\Models\Medicament;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Utilisateurs', User::count())
                ->description('Total des comptes actifs')
                ->descriptionIcon('heroicon-m-users')
                ->chart([7, 2, 10, 3, 15, 4, 17])
                ->color('info'),
            Stat::make('Médicaments', Medicament::count())
                ->description('Inventaire global')
                ->descriptionIcon('heroicon-m-beaker')
                ->chart([15, 12, 18, 14, 20, 16, 22])
                ->color('success'),
            Stat::make('Stocks Critiques', Medicament::whereColumn('quantite', '<=', 'seuil_alerte')->count())
                ->description('Nécessitent une attention')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color('danger'),
            Stat::make('Dépenses Totales', number_format(Achat::sum('prix'), 2, ',', ' ') . ' DH')
                ->description('Historique des achats')
                ->descriptionIcon('heroicon-m-shopping-cart')
                ->chart([2, 10, 5, 12, 8, 15, 10])
                ->color('warning'),
        ];
    }
}
