<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDotfileRequest;
use App\Http\Resources\DotfileDownloadResource;
use App\Http\Resources\DotfileResource;
use App\Models\Dotfile;
use App\Models\Environment;
use App\Services\DotfileStorageService;
use App\Services\EncryptedPayloadValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Recibe blobs cifrados Zero-Knowledge sin descifrar.
 *
 * Flujo:
 * 1. Cliente cifra localmente con passphrase (AES-256-GCM).
 * 2. Envía encrypted_payload (JSON con campos Base64) + content_hash + payload_hash.
 * 3. Servidor valida estructura y payload_hash sobre bytes opacos.
 * 4. Almacena JSON en Storage; content_hash se guarda como metadata opaca para sync del CLI.
 */
class DotfileController extends Controller
{
    public function __construct(
        private readonly EncryptedPayloadValidator $payloadValidator,
        private readonly DotfileStorageService $storageService,
    ) {}

    public function store(StoreDotfileRequest $request, Environment $environment): JsonResponse
    {
        if ($environment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        /** @var array<string, mixed> $encryptedPayload */
        $encryptedPayload = $request->input('encrypted_payload');

        try {
            $validatedPayload = $this->payloadValidator->validate(
                $encryptedPayload,
                $request->string('payload_hash')->toString(),
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        $serializedPayload = $this->payloadValidator->serializeForStorage($validatedPayload);

        $dotfile = DB::transaction(function () use ($request, $environment, $serializedPayload): Dotfile {
            $existing = $environment->dotfiles()
                ->where('original_path', $request->string('original_path')->toString())
                ->first();

            if ($existing !== null) {
                $this->archiveCurrentVersion($existing, $request->string('commit_message')->toString() ?: null);
            }

            $dotfile = $existing ?? new Dotfile(['environment_id' => $environment->id]);

            $dotfile->fill([
                'original_path' => $request->string('original_path')->toString(),
                'filename' => $request->string('filename')->toString(),
                'content_hash' => strtolower($request->string('content_hash')->toString()),
            ]);

            $dotfile->save();

            $storagePath = $this->storageService->storeCurrent(
                $environment->sync_token,
                $dotfile->id,
                $serializedPayload,
            );

            $dotfile->update(['storage_path' => $storagePath]);

            return $dotfile->refresh();
        });

        return (new DotfileResource($dotfile))
            ->response()
            ->setStatusCode($request->isMethod('post') ? 201 : 200);
    }

    public function show(Request $request, Environment $environment, Dotfile $dotfile): JsonResponse
    {
        if ($environment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($dotfile->environment_id !== $environment->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $stored = $this->storageService->read($dotfile->storage_path);

        if ($stored === null) {
            return response()->json(['message' => 'Encrypted payload not found in storage.'], 404);
        }

        try {
            $encryptedPayload = $this->payloadValidator->deserializeFromStorage($stored);
            $payloadHash = $this->payloadValidator->computePayloadHash($encryptedPayload);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 500);
        }

        return (new DotfileDownloadResource([
            'original_path' => $dotfile->original_path,
            'filename' => $dotfile->filename,
            'content_hash' => $dotfile->content_hash,
            'payload_hash' => $payloadHash,
            'encrypted_payload' => $encryptedPayload,
        ]))->response();
    }

    private function archiveCurrentVersion(Dotfile $dotfile, ?string $commitMessage): void
    {
        $dotfile->loadMissing('environment');

        $stored = $this->storageService->read($dotfile->storage_path);

        if ($stored === null) {
            return;
        }

        $historyPath = $this->storageService->storeHistory(
            $dotfile->environment->sync_token,
            $dotfile->id,
            $stored,
        );

        $dotfile->fileHistories()->create([
            'content_hash' => $dotfile->content_hash,
            'storage_path' => $historyPath,
            'commit_message' => $commitMessage,
        ]);
    }
}
