<?php

declare(strict_types=1);

namespace App\Services;

use InvalidArgumentException;

/**
 * Valida payloads cifrados Zero-Knowledge sin descifrar.
 *
 * El servidor opera sobre bytes opacos: decodifica Base64, verifica longitudes
 * criptográficas y recomputa payload_hash. Nunca tiene acceso a la passphrase.
 */
final class EncryptedPayloadValidator
{
    public const PAYLOAD_VERSION = 1;

    public const SALT_LENGTH = 16;

    public const IV_LENGTH = 12;

    public const TAG_LENGTH = 16;

    public const PBKDF2_ITERATIONS = 600_000;

    /**
     * @param  array<string, mixed>  $payload
     * @return array{
     *     v: int,
     *     alg: string,
     *     kdf: string,
     *     kdfIterations: int,
     *     salt: string,
     *     iv: string,
     *     ciphertext: string,
     *     tag: string
     * }
     */
    public function validate(array $payload, string $expectedPayloadHash): array
    {
        $this->assertStructure($payload);

        $salt = $this->decodeBase64($payload['salt'], 'salt');
        $iv = $this->decodeBase64($payload['iv'], 'iv');
        $ciphertext = $this->decodeBase64($payload['ciphertext'], 'ciphertext');
        $tag = $this->decodeBase64($payload['tag'], 'tag');

        $this->assertLength($salt, self::SALT_LENGTH, 'salt');
        $this->assertLength($iv, self::IV_LENGTH, 'iv');
        $this->assertLength($tag, self::TAG_LENGTH, 'tag');

        if ($ciphertext === '') {
            throw new InvalidArgumentException('El ciphertext no puede estar vacío.');
        }

        $binary = $salt.$iv.$ciphertext.$tag;
        $actualHash = hash('sha256', $binary);

        if (! hash_equals(strtolower($expectedPayloadHash), $actualHash)) {
            throw new InvalidArgumentException(
                'payload_hash inválido: el blob cifrado pudo corromperse durante el transporte.',
            );
        }

        /** @var array{v: int, alg: string, kdf: string, kdfIterations: int, salt: string, iv: string, ciphertext: string, tag: string} $payload */
        return $payload;
    }

    /**
     * Serializa payload validado para almacenamiento en disco (JSON compacto, UTF-8).
     *
     * @param  array<string, mixed>  $payload
     */
    public function serializeForStorage(array $payload): string
    {
        $validated = $this->normalize($payload);

        $json = json_encode($validated, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);

        if (! is_string($json)) {
            throw new InvalidArgumentException('No se pudo serializar el payload cifrado.');
        }

        return $json;
    }

    /**
     * @return array<string, mixed>
     */
    public function deserializeFromStorage(string $stored): array
    {
        $payload = json_decode($stored, true, 512, JSON_THROW_ON_ERROR);

        if (! is_array($payload)) {
            throw new InvalidArgumentException('Payload almacenado corrupto.');
        }

        return $this->normalize($payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function computePayloadHash(array $payload): string
    {
        $normalized = $this->normalize($payload);

        $binary = $this->decodeBase64($normalized['salt'], 'salt')
            .$this->decodeBase64($normalized['iv'], 'iv')
            .$this->decodeBase64($normalized['ciphertext'], 'ciphertext')
            .$this->decodeBase64($normalized['tag'], 'tag');

        return hash('sha256', $binary);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function assertStructure(array $payload): void
    {
        $stringFields = ['alg', 'kdf', 'salt', 'iv', 'ciphertext', 'tag'];

        foreach ($stringFields as $field) {
            if (! isset($payload[$field]) || ! is_string($payload[$field]) || $payload[$field] === '') {
                throw new InvalidArgumentException("Campo requerido ausente o inválido: {$field}.");
            }
        }

        if (! isset($payload['v']) || ! is_int($payload['v'])) {
            throw new InvalidArgumentException('Campo requerido ausente o inválido: v.');
        }

        if (! isset($payload['kdfIterations']) || ! is_int($payload['kdfIterations'])) {
            throw new InvalidArgumentException('Campo requerido ausente o inválido: kdfIterations.');
        }

        if ($payload['v'] !== self::PAYLOAD_VERSION) {
            throw new InvalidArgumentException('Versión de payload no soportada.');
        }

        if ($payload['alg'] !== 'AES-256-GCM') {
            throw new InvalidArgumentException('Algoritmo de cifrado no soportado.');
        }

        if ($payload['kdf'] !== 'PBKDF2-SHA256') {
            throw new InvalidArgumentException('KDF no soportado.');
        }

        if ($payload['kdfIterations'] !== self::PBKDF2_ITERATIONS) {
            throw new InvalidArgumentException('Iteraciones PBKDF2 no soportadas.');
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{v: int, alg: string, kdf: string, kdfIterations: int, salt: string, iv: string, ciphertext: string, tag: string}
     */
    private function normalize(array $payload): array
    {
        $this->assertStructure($payload);

        return [
            'v' => self::PAYLOAD_VERSION,
            'alg' => 'AES-256-GCM',
            'kdf' => 'PBKDF2-SHA256',
            'kdfIterations' => self::PBKDF2_ITERATIONS,
            'salt' => (string) $payload['salt'],
            'iv' => (string) $payload['iv'],
            'ciphertext' => (string) $payload['ciphertext'],
            'tag' => (string) $payload['tag'],
        ];
    }

    private function decodeBase64(mixed $value, string $field): string
    {
        if (! is_string($value) || $value === '') {
            throw new InvalidArgumentException("Campo {$field} debe ser Base64 no vacío.");
        }

        $decoded = base64_decode($value, true);

        if ($decoded === false) {
            throw new InvalidArgumentException("Campo {$field} contiene Base64 inválido.");
        }

        return $decoded;
    }

    private function assertLength(string $bytes, int $expected, string $field): void
    {
        $actual = strlen($bytes);

        if ($actual !== $expected) {
            throw new InvalidArgumentException(
                "Campo {$field} inválido: esperado {$expected} bytes, recibido {$actual}.",
            );
        }
    }
}
