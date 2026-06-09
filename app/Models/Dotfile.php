<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\DotfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dotfile extends Model
{
    /** @use HasFactory<DotfileFactory> */
    use HasFactory;

    protected $fillable = [
        'environment_id',
        'original_path',
        'filename',
        'content_hash',
        'storage_path',
    ];

    /** @return BelongsTo<Environment, $this> */
    public function environment(): BelongsTo
    {
        return $this->belongsTo(Environment::class);
    }

    /** @return HasMany<FileHistory, $this> */
    public function fileHistories(): HasMany
    {
        return $this->hasMany(FileHistory::class)->latest('created_at');
    }
}
