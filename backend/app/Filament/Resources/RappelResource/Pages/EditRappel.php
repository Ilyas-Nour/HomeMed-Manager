<?php

namespace App\Filament\Resources\RappelResource\Pages;

use App\Filament\Resources\RappelResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditRappel extends EditRecord
{
    protected static string $resource = RappelResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
