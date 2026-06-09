<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Respuesta de descarga con blob cifrado para descifrar en el CLI.
 *
 * @property array{
 *     original_path: string,
 *     filename: string,
 *     content_hash: string,
 *     payload_hash: string,
 *     encrypted_payload: array<string, mixed>
 * } $resource
 */
class DotfileDownloadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'original_path' => $this->resource['original_path'],
            'filename' => $this->resource['filename'],
            'content_hash' => $this->resource['content_hash'],
            'payload_hash' => $this->resource['payload_hash'],
            'encrypted_payload' => $this->resource['encrypted_payload'],
        ];
    }
}
