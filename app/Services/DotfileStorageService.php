<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class DotfileStorageService
{
    private const DISK = 'dotfiles';

    public function storeCurrent(string $environmentSyncToken, int $dotfileId, string $encryptedContent): string
    {
        $path = $this->buildPath($environmentSyncToken, 'current', (string) $dotfileId);

        Storage::disk(self::DISK)->put($path, $encryptedContent);

        return $path;
    }

    public function storeHistory(string $environmentSyncToken, int $dotfileId, string $encryptedContent): string
    {
        $path = $this->buildPath(
            $environmentSyncToken,
            'history/'.$dotfileId,
            Str::uuid()->toString(),
        );

        Storage::disk(self::DISK)->put($path, $encryptedContent);

        return $path;
    }

    public function read(string $storagePath): ?string
    {
        if (! Storage::disk(self::DISK)->exists($storagePath)) {
            return null;
        }

        return Storage::disk(self::DISK)->get($storagePath);
    }

    public function delete(string $storagePath): bool
    {
        return Storage::disk(self::DISK)->delete($storagePath);
    }

    public static function hashContent(string $content): string
    {
        return hash('sha256', $content);
    }

    private function buildPath(string $environmentSyncToken, string $segment, string $filename): string
    {
        return sprintf('%s/%s/%s', $environmentSyncToken, $segment, $filename);
    }
}
