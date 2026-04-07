<?php

namespace Database\Factories;

use App\Models\Profil;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profil>
 */
class ProfilFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nom' => $this->faker->firstName,
            'relation' => $this->faker->randomElement(['Lui-même', 'Enfant', 'Conjoint', 'Parent']),
            'date_naissance' => $this->faker->date(),
            'photo' => null,
        ];
    }
}
