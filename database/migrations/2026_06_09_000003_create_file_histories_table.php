<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_histories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('dotfile_id')->constrained()->cascadeOnDelete();
            $table->char('content_hash', 64);
            $table->string('storage_path');
            $table->string('commit_message')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['dotfile_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_histories');
    }
};
