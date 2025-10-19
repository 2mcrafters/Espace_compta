<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->enum('status', ['EN_ATTENTE','EN_RELANCE','RECU','INCOMPLET','VALIDE'])->default('EN_ATTENTE');
            $table->date('due_date')->nullable();
            $table->timestamps();

            $table->index(['client_id']);
            $table->index(['created_by']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
