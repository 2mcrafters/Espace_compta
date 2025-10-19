<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('portfolios')->cascadeOnDelete();
            $table->string('raison_sociale');
            $table->string('rc')->nullable();
            $table->string('if')->nullable();
            $table->string('ice')->nullable();
            $table->string('forme_juridique')->nullable();
            $table->date('date_creation')->nullable();
            $table->decimal('capital_social', 15, 2)->nullable();
            $table->string('responsable_client')->nullable();
            $table->string('telephone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('type_mission')->nullable();
            $table->decimal('montant_contrat', 15, 2)->nullable();
            $table->timestamps();

            $table->index(['portfolio_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
