<?php

namespace Database\Factories;

use App\Models\Prise;
use App\Models\Rappel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prise>
 */
class PriseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rappel_id' => Rappel::factory(),
            'date_prise' => $this->faker->date(),
            'pris' => $this->faker->boolean(80),
        ];
    }
}
