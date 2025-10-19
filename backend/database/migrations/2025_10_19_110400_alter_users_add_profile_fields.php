<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'first_name')) $table->string('first_name')->nullable()->after('name');
            if (!Schema::hasColumn('users', 'last_name')) $table->string('last_name')->nullable()->after('first_name');
            if (!Schema::hasColumn('users', 'phone')) $table->string('phone', 30)->nullable()->after('email');
            if (!Schema::hasColumn('users', 'internal_id')) $table->string('internal_id')->nullable()->unique()->after('phone');
            if (!Schema::hasColumn('users', 'job_title')) $table->string('job_title')->nullable()->after('internal_id');
            if (!Schema::hasColumn('users', 'monthly_hours_target')) $table->decimal('monthly_hours_target', 6, 2)->nullable()->after('job_title');
            if (!Schema::hasColumn('users', 'yearly_hours_target')) $table->decimal('yearly_hours_target', 7, 2)->nullable()->after('monthly_hours_target');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach (['first_name','last_name','phone','internal_id','job_title','monthly_hours_target','yearly_hours_target'] as $col) {
                if (Schema::hasColumn('users', $col)) $table->dropColumn($col);
            }
        });
    }
};
