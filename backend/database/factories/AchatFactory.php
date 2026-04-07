<?php

namespace Database\Factories;

use App\Models\Achat;
use App\Models\Medicament;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Achat>
 */
class AchatFactory extends Factory
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
            'pharmacie' => $this->faker->company().' Pharmacie',
            'prix' => $this->faker->randomFloat(2, 5, 100),
            'quantite' => $this->faker->numberBetween(1, 10),
            'date_achat' => $this->faker->date(),
        ];
    }
}
