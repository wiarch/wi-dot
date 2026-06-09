<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Dotfile;
use App\Models\Environment;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Dotfile> */
class DotfileFactory extends Factory
{
    protected $model = Dotfile::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = fake()->word().'.conf';

        return [
            'environment_id' => Environment::factory(),
            'original_path' => '~/.config/'.fake()->word().'/'.$filename,
            'filename' => $filename,
            'content_hash' => hash('sha256', fake()->text()),
            'storage_path' => fake()->uuid().'/current/1',
        ];
    }
}
