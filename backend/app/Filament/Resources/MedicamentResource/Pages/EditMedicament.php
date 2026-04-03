<?php

namespace App\Filament\Resources\MedicamentResource\Pages;

use App\Filament\Resources\MedicamentResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMedicament extends EditRecord
{
    protected static string $resource = MedicamentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
