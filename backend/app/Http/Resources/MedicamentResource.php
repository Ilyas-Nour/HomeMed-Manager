<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicamentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'nom'               => $this->nom,
            'type'              => $this->type,
            'quantite'          => $this->quantite,
            'seuil_alerte'       => $this->seuil_alerte,
            'date_expiration'   => $this->date_expiration,
            'stock_faible'      => $this->stock_faible,
            'expire'            => $this->expire,
            'traitement_actif'  => $this->traitement_actif,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
            // On peut ajouter des relations ici si besoin avec $this->whenLoaded('relation')
        ];
    }
}
