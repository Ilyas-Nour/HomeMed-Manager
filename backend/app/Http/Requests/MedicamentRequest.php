<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest pour la validation de la création et la modification de médicament.
 * Valide tous les champs définis dans le cahier des charges.
 */
class MedicamentRequest extends FormRequest
{
    /**
     * L'accès est contrôlé par le middleware Sanctum sur la route.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour un médicament.
     * Les règles 'sometimes' permettent d'utiliser ce FormRequest
     * aussi bien pour la création (POST) que la mise à jour partielle (PATCH).
     */
    public function rules(): array
    {
        $estCreation = $this->isMethod('post');

        return [
            'nom' => [
                $estCreation ? 'required' : 'sometimes',
                'string',
                'min:2',
                'max:255',
            ],
            'type' => [
                $estCreation ? 'required' : 'sometimes',
                'string',
                'in:comprimé,sirop,injection,crème,gouttes,patch,suppositoire,autre',
            ],
            'posologie' => [
                $estCreation ? 'required' : 'sometimes',
                'string',
                'min:5',
                'max:1000',
            ],
            'date_debut' => [
                $estCreation ? 'required' : 'sometimes',
                'date',
                'date_format:Y-m-d',
            ],
            'date_fin' => [
                'nullable',
                'date',
                'date_format:Y-m-d',
                'after_or_equal:date_debut',
            ],
            'date_expiration' => [
                'nullable',
                'date',
                'date_format:Y-m-d',
            ],
            'quantite' => [
                $estCreation ? 'required' : 'sometimes',
                'integer',
                'min:0',
            ],
            'seuil_alerte' => [
                'sometimes',
                'integer',
                'min:0',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    /**
     * Messages d'erreur de validation en français.
     */
    public function messages(): array
    {
        return [
            'nom.required'              => 'Le nom du médicament est obligatoire.',
            'nom.min'                   => 'Le nom doit contenir au moins 2 caractères.',
            'type.required'             => 'Le type du médicament est obligatoire.',
            'type.in'                   => 'Le type sélectionné est invalide. Types acceptés : comprimé, sirop, injection, crème, gouttes, patch, suppositoire, autre.',
            'posologie.required'        => 'La posologie est obligatoire.',
            'posologie.min'             => 'La posologie doit contenir au moins 5 caractères.',
            'date_debut.required'       => 'La date de début du traitement est obligatoire.',
            'date_debut.date'           => 'La date de début n\'est pas valide.',
            'date_fin.date'             => 'La date de fin n\'est pas valide.',
            'date_fin.after_or_equal'   => 'La date de fin doit être égale ou postérieure à la date de début.',
            'date_expiration.date'      => 'La date d\'expiration n\'est pas valide.',
            'quantite.required'         => 'La quantité disponible est obligatoire.',
            'quantite.integer'          => 'La quantité doit être un nombre entier.',
            'quantite.min'              => 'La quantité ne peut pas être négative.',
            'seuil_alerte.min'          => 'Le seuil d\'alerte ne peut pas être négatif.',
            'notes.max'                 => 'Les notes ne peuvent pas dépasser 2000 caractères.',
        ];
    }
}
