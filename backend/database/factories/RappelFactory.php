<?php

namespace Database\Factories;

use App\Models\Medicament;
use App\Models\Rappel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rappel>
 */
class RappelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'medicament_id' => Medicament::factory(),
            'moment' => $this->faker->randomElement(['matin', 'midi', 'soir', 'apres-midi', 'coucher', 'libre']),
            'heure' => $this->faker->time('H:i'),
        ];
    }
}
