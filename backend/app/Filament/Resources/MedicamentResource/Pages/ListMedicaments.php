<?php

namespace App\Filament\Resources\MedicamentResource\Pages;

use App\Filament\Resources\MedicamentResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListMedicaments extends ListRecords
{
    protected static string $resource = MedicamentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
