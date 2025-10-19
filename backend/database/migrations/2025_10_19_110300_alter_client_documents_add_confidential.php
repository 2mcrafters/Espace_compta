<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_documents', function (Blueprint $table) {
            if (!Schema::hasColumn('client_documents', 'is_confidential')) {
                $table->boolean('is_confidential')->default(false)->after('size');
            }
        });
    }

    public function down(): void
    {
        Schema::table('client_documents', function (Blueprint $table) {
            if (Schema::hasColumn('client_documents', 'is_confidential')) {
                $table->dropColumn('is_confidential');
            }
        });
    }
};
