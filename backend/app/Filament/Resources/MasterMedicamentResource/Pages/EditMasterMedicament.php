<?php

namespace App\Filament\Resources\MasterMedicamentResource\Pages;

use App\Filament\Resources\MasterMedicamentResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMasterMedicament extends EditRecord
{
    protected static string $resource = MasterMedicamentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
