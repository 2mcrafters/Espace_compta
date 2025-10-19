<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('portfolio_user')) {
            Schema::create('portfolio_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('portfolio_id')->constrained('portfolios')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['portfolio_id','user_id']);
            });
        }
        if (!Schema::hasTable('client_user')) {
            Schema::create('client_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['client_id','user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('client_user');
        Schema::dropIfExists('portfolio_user');
    }
};
