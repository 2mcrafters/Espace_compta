<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('category', ['COMPTABLE','FISCALE','SOCIALE','JURIDIQUE','AUTRE']);
            $table->enum('nature', ['CONTINUE','PONCTUELLE']);
            $table->enum('status', ['EN_ATTENTE','EN_COURS','EN_VALIDATION','TERMINEE'])->default('EN_ATTENTE');
            $table->unsignedTinyInteger('priority')->default(0);
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->longText('notes')->nullable();
            $table->timestamps();

            $table->index(['client_id']);
            $table->index(['owner_id']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
