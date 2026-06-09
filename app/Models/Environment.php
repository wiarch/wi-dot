<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\EnvironmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Environment extends Model
{
    /** @use HasFactory<EnvironmentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'sync_token',
    ];

    protected function casts(): array
    {
        return [
            'sync_token' => 'string',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Environment $environment): void {
            if ($environment->sync_token === null) {
                $environment->sync_token = (string) Str::uuid();
            }
        });
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Dotfile, $this> */
    public function dotfiles(): HasMany
    {
        return $this->hasMany(Dotfile::class);
    }
}
