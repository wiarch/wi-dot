<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Environment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Environment> */
class EnvironmentFactory extends Factory
{
    protected $model = Environment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'sync_token' => (string) Str::uuid(),
        ];
    }
}
