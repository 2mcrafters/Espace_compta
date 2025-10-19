<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $teams = config('permission.teams');

        // Fallbacks if config is not loaded
        if (empty($tableNames)) {
            $tableNames = [
                'roles' => 'roles',
                'permissions' => 'permissions',
                'model_has_permissions' => 'model_has_permissions',
                'model_has_roles' => 'model_has_roles',
                'role_has_permissions' => 'role_has_permissions',
            ];
        }
        if (empty($columnNames)) {
            $columnNames = [
                'team_foreign_key' => 'team_id',
            ];
        }
        if ($teams === null) {
            $teams = false;
        }

        if (!Schema::hasTable($tableNames['permissions'])) {
            Schema::create($tableNames['permissions'], function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('name');
                $table->string('guard_name');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable($tableNames['roles'])) {
            Schema::create($tableNames['roles'], function (Blueprint $table) use ($columnNames, $teams) {
                $table->bigIncrements('id');
                if ($teams) {
                    $table->unsignedBigInteger($columnNames['team_foreign_key'])->nullable();
                    $table->index($columnNames['team_foreign_key'], 'roles_team_foreign_key_index');
                }
                $table->string('name');
                $table->string('guard_name');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable($tableNames['model_has_permissions'])) {
            Schema::create($tableNames['model_has_permissions'], function (Blueprint $table) use ($tableNames, $columnNames, $teams) {
                $table->unsignedBigInteger('permission_id');
                $table->string('model_type');
                $table->unsignedBigInteger('model_id');
                if ($teams) {
                    $table->unsignedBigInteger($columnNames['team_foreign_key']);
                    $table->index([$columnNames['team_foreign_key'], 'model_id', 'model_type'], 'model_has_permissions_team_model_type_index');
                } else {
                    $table->index(['model_id', 'model_type'], 'model_has_permissions_model_id_model_type_index');
                }

                $table->foreign('permission_id')
                    ->references('id')
                    ->on($tableNames['permissions'])
                    ->onDelete('cascade');

                if ($teams) {
                    $table->primary([$columnNames['team_foreign_key'], 'permission_id', 'model_id', 'model_type'], 'model_has_permissions_primary');
                } else {
                    $table->primary(['permission_id', 'model_id', 'model_type'], 'model_has_permissions_primary');
                }
            });
        }

        if (!Schema::hasTable($tableNames['model_has_roles'])) {
            Schema::create($tableNames['model_has_roles'], function (Blueprint $table) use ($tableNames, $columnNames, $teams) {
                $table->unsignedBigInteger('role_id');
                $table->string('model_type');
                $table->unsignedBigInteger('model_id');
                if ($teams) {
                    $table->unsignedBigInteger($columnNames['team_foreign_key']);
                    $table->index([$columnNames['team_foreign_key'], 'model_id', 'model_type'], 'model_has_roles_team_model_type_index');
                } else {
                    $table->index(['model_id', 'model_type'], 'model_has_roles_model_id_model_type_index');
                }

                $table->foreign('role_id')
                    ->references('id')
                    ->on($tableNames['roles'])
                    ->onDelete('cascade');

                if ($teams) {
                    $table->primary([$columnNames['team_foreign_key'], 'role_id', 'model_id', 'model_type'], 'model_has_roles_primary');
                } else {
                    $table->primary(['role_id', 'model_id', 'model_type'], 'model_has_roles_primary');
                }
            });
        }

        if (!Schema::hasTable($tableNames['role_has_permissions'])) {
            Schema::create($tableNames['role_has_permissions'], function (Blueprint $table) use ($tableNames) {
                $table->unsignedBigInteger('permission_id');
                $table->unsignedBigInteger('role_id');

                $table->foreign('permission_id')
                    ->references('id')
                    ->on($tableNames['permissions'])
                    ->onDelete('cascade');
                $table->foreign('role_id')
                    ->references('id')
                    ->on($tableNames['roles'])
                    ->onDelete('cascade');

                $table->primary(['permission_id', 'role_id'], 'role_has_permissions_primary');
            });
        }

        if (class_exists(\Spatie\Permission\PermissionRegistrar::class)) {
            try {
                app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
            } catch (\Throwable $e) {
                // ignore if not resolvable at this stage
            }
        }
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');

        Schema::dropIfExists($tableNames['role_has_permissions']);
        Schema::dropIfExists($tableNames['model_has_roles']);
        Schema::dropIfExists($tableNames['model_has_permissions']);
        Schema::dropIfExists($tableNames['roles']);
        Schema::dropIfExists($tableNames['permissions']);
    }
};
