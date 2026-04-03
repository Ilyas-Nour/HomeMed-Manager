<?php

namespace App\Filament\Resources\GroupeResource\Pages;

use App\Filament\Resources\GroupeResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditGroupe extends EditRecord
{
    protected static string $resource = GroupeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
