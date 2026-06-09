<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Dotfile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Dotfile */
class DotfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'original_path' => $this->original_path,
            'filename' => $this->filename,
            'content_hash' => $this->content_hash,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'file_histories' => FileHistoryResource::collection($this->whenLoaded('fileHistories')),
        ];
    }
}
