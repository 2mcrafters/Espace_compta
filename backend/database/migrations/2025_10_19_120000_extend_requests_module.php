<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('requests')) {
            Schema::create('requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('client_id')->constrained()->cascadeOnDelete();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->enum('status', ['EN_ATTENTE','EN_RELANCE','RECU','INCOMPLET','VALIDE'])->default('EN_ATTENTE');
                $table->date('due_date')->nullable();
                $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
                $table->date('period_from')->nullable();
                $table->date('period_to')->nullable();
                $table->unsignedInteger('reminders_count')->default(0);
                $table->timestamp('first_sent_at')->nullable();
                $table->timestamp('responded_at')->nullable();
                $table->json('reminders')->nullable(); // [{at, by, note}]
                $table->timestamps();
            });
        } else {
            Schema::table('requests', function (Blueprint $table) {
                if (!Schema::hasColumn('requests','task_id')) $table->foreignId('task_id')->nullable()->after('client_id')->constrained('tasks')->nullOnDelete();
                if (!Schema::hasColumn('requests','period_from')) $table->date('period_from')->nullable()->after('due_date');
                if (!Schema::hasColumn('requests','period_to')) $table->date('period_to')->nullable()->after('period_from');
                if (!Schema::hasColumn('requests','reminders_count')) $table->unsignedInteger('reminders_count')->default(0)->after('status');
                if (!Schema::hasColumn('requests','first_sent_at')) $table->timestamp('first_sent_at')->nullable()->after('reminders_count');
                if (!Schema::hasColumn('requests','responded_at')) $table->timestamp('responded_at')->nullable()->after('first_sent_at');
                if (!Schema::hasColumn('requests','reminders')) $table->json('reminders')->nullable()->after('responded_at');
            });
        }

        if (!Schema::hasTable('request_messages')) {
            Schema::create('request_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->longText('message_html');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('request_files')) {
            Schema::create('request_files', function (Blueprint $table) {
                $table->id();
                $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
                $table->string('path');
                $table->string('original_name');
                $table->unsignedBigInteger('size_bytes')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('request_files');
        Schema::dropIfExists('request_messages');
        // Keep base requests table to avoid data loss; columns could be dropped if needed.
    }
};
