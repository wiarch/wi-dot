<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnvironmentRequest;
use App\Http\Resources\DotfileResource;
use App\Http\Resources\EnvironmentResource;
use App\Models\Environment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EnvironmentController extends Controller
{
    public function store(StoreEnvironmentRequest $request): JsonResponse
    {
        $environment = $request->user()
            ->environments()
            ->create($request->validated());

        return (new EnvironmentResource($environment))
            ->response()
            ->setStatusCode(201);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $environments = $request->user()
            ->environments()
            ->latest()
            ->get();

        return EnvironmentResource::collection($environments);
    }

    public function dotfiles(Request $request, Environment $environment): AnonymousResourceCollection|JsonResponse
    {
        if ($environment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $dotfiles = $environment->dotfiles()
            ->with('fileHistories')
            ->latest()
            ->get();

        return DotfileResource::collection($dotfiles);
    }
}
