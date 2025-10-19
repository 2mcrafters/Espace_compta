<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (!Schema::hasColumn('clients', 'adresse')) {
                $table->string('adresse')->nullable()->after('ice');
            }
            if (!Schema::hasColumn('clients', 'statut_juridique')) {
                $table->string('statut_juridique')->nullable()->after('forme_juridique');
            }
            if (!Schema::hasColumn('clients', 'associes')) {
                $table->json('associes')->nullable()->after('capital_social');
            }
            if (!Schema::hasColumn('clients', 'regime_fiscal')) {
                $table->string('regime_fiscal')->nullable()->after('associes');
            }
            if (!Schema::hasColumn('clients', 'date_debut_collaboration')) {
                $table->date('date_debut_collaboration')->nullable()->after('regime_fiscal');
            }
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'adresse')) {
                $table->dropColumn('adresse');
            }
            if (Schema::hasColumn('clients', 'statut_juridique')) {
                $table->dropColumn('statut_juridique');
            }
            if (Schema::hasColumn('clients', 'associes')) {
                $table->dropColumn('associes');
            }
            if (Schema::hasColumn('clients', 'regime_fiscal')) {
                $table->dropColumn('regime_fiscal');
            }
            if (Schema::hasColumn('clients', 'date_debut_collaboration')) {
                $table->dropColumn('date_debut_collaboration');
            }
        });
    }
};
