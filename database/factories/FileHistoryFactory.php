<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Dotfile;
use App\Models\FileHistory;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<FileHistory> */
class FileHistoryFactory extends Factory
{
    protected $model = FileHistory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dotfile_id' => Dotfile::factory(),
            'content_hash' => hash('sha256', fake()->text()),
            'storage_path' => fake()->uuid().'/history/1/'.fake()->uuid(),
            'commit_message' => fake()->optional()->sentence(),
        ];
    }
}
