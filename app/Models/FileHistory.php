<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\FileHistoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FileHistory extends Model
{
    /** @use HasFactory<FileHistoryFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'dotfile_id',
        'content_hash',
        'storage_path',
        'commit_message',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Dotfile, $this> */
    public function dotfile(): BelongsTo
    {
        return $this->belongsTo(Dotfile::class);
    }
}
