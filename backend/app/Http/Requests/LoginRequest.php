<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest pour la validation de la connexion.
 */
class LoginRequest extends FormRequest
{
    /**
     * La connexion est toujours publique.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Règles de validation pour la connexion.
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Messages d'erreur de validation en français.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
            'password.required' => 'Le mot de passe est obligatoire.',
        ];
    }
}
