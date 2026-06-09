<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\FileHistory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin FileHistory */
class FileHistoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content_hash' => $this->content_hash,
            'commit_message' => $this->commit_message,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
