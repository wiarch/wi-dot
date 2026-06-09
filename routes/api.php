<?php

declare(strict_types=1);

use App\Http\Controllers\Api\DotfileController;
use App\Http\Controllers\Api\EnvironmentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/environments', [EnvironmentController::class, 'index']);
    Route::post('/environments', [EnvironmentController::class, 'store']);
    Route::get('/environments/{environment}/dotfiles', [EnvironmentController::class, 'dotfiles']);

    Route::post('/environments/{environment}/dotfiles', [DotfileController::class, 'store']);
    Route::get('/environments/{environment}/dotfiles/{dotfile}', [DotfileController::class, 'show']);
});
