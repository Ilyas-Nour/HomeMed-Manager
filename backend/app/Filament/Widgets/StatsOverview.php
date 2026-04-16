<?php

namespace App\Filament\Widgets;

use App\Models\Achat;
use App\Models\Medicament;
use App\Models\Rappel;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return Cache::remember('filament_stats_overview', now()->addMinutes(5), function () {

            // Real 7-day trend for users
            $userTrend = collect(range(6, 0))->map(fn ($d) =>
                User::whereDate('created_at', Carbon::today()->subDays($d))->count()
            )->toArray();

            // Real 7-day trend for medications added
            $medTrend = collect(range(6, 0))->map(fn ($d) =>
                Medicament::whereDate('created_at', Carbon::today()->subDays($d))->count()
            )->toArray();

            $criticalCount = Medicament::whereColumn('quantite', '<=', 'seuil_alerte')->count();

            $todayAchats = Achat::whereDate('date_achat', today())->sum('prix');

            return [
                Stat::make('Utilisateurs', User::count())
                    ->description(User::whereDate('created_at', today())->count() . ' nouveaux aujourd\'hui')
                    ->descriptionIcon('heroicon-m-users')
                    ->chart($userTrend)
                    ->color('info'),

                Stat::make('Médicaments', Medicament::count())
                    ->description('Inventaire global')
                    ->descriptionIcon('heroicon-m-beaker')
                    ->chart($medTrend)
                    ->color('success'),

                Stat::make('Stocks Critiques', $criticalCount)
                    ->description($criticalCount > 0 ? 'Nécessitent une attention urgente' : 'Tous les stocks sont OK')
                    ->descriptionIcon('heroicon-m-exclamation-triangle')
                    ->color($criticalCount > 0 ? 'danger' : 'success'),

                Stat::make('Rappels Actifs', Rappel::count())
                    ->description('Plannings de prises')
                    ->descriptionIcon('heroicon-m-bell')
                    ->color('warning'),

                Stat::make('Achats du jour', number_format($todayAchats, 2, ',', ' ') . ' MAD')
                    ->description('Dépenses totales: ' . number_format(Achat::sum('prix'), 2, ',', ' ') . ' MAD')
                    ->descriptionIcon('heroicon-m-shopping-cart')
                    ->color('gray'),
            ];
        });
    }
}
