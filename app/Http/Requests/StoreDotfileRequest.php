<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Services\EncryptedPayloadValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreDotfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'original_path' => ['required', 'string', 'max:1024'],
            'filename' => ['required', 'string', 'max:255'],
            'content_hash' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/i'],
            'payload_hash' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/i'],
            'encrypted_payload' => ['required', 'array'],
            'encrypted_payload.v' => ['required', 'integer'],
            'encrypted_payload.alg' => ['required', 'string'],
            'encrypted_payload.kdf' => ['required', 'string'],
            'encrypted_payload.kdfIterations' => ['required', 'integer'],
            'encrypted_payload.salt' => ['required', 'string'],
            'encrypted_payload.iv' => ['required', 'string'],
            'encrypted_payload.ciphertext' => ['required', 'string'],
            'encrypted_payload.tag' => ['required', 'string'],
            'commit_message' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            try {
                app(EncryptedPayloadValidator::class)->validate(
                    $this->input('encrypted_payload', []),
                    $this->string('payload_hash')->toString(),
                );
            } catch (\InvalidArgumentException $exception) {
                $validator->errors()->add('encrypted_payload', $exception->getMessage());
            }
        });
    }
}
