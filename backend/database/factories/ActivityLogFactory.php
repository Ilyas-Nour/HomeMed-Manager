<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityLog>
 */
class ActivityLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'action' => $this->faker->randomElement(['LOGIN', 'MEDICAMENT_CREATE', 'PRISE_VALIDATE', 'ACHAT_ADD']),
            'description' => $this->faker->sentence(),
            'metadata' => ['ip' => $this->faker->ipv4, 'user_agent' => $this->faker->userAgent],
        ];
    }
}
