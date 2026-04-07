<?php

namespace Database\Factories;

use App\Models\Medicament;
use App\Models\Profil;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medicament>
 */
class MedicamentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'profil_id' => Profil::factory(),
            'nom' => $this->faker->words(2, true),
            'type' => $this->faker->randomElement(['comprimé', 'sirop', 'injection', 'crème']),
            'posologie' => $this->faker->sentence(),
            'date_debut' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'quantite' => $this->faker->numberBetween(5, 50),
            'seuil_alerte' => $this->faker->numberBetween(2, 5),
        ];
    }
}
