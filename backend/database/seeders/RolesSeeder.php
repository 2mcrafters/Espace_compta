<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // Define permissions (function-level)
        $permissions = [
            // Portfolios
            'portfolios.view', 'portfolios.edit',
            // Clients (dossiers)
            'clients.view', 'clients.edit',
            // Tasks
            'tasks.manage', 'tasks.update',
            // Users & rates
            'users.view', 'users.edit', 'users.rate.set',
            // Time / productivity
            'time.approve', 'reports.view', 'exports.view',
            // Requests (demande clients)
            'requests.manage', 'requests.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'ADMIN', 'guard_name' => 'web']);
        $chef = Role::firstOrCreate(['name' => 'CHEF_EQUIPE', 'guard_name' => 'web']);
        $collab = Role::firstOrCreate(['name' => 'COLLABORATEUR', 'guard_name' => 'web']);
        $assistant = Role::firstOrCreate(['name' => 'ASSISTANT', 'guard_name' => 'web']);

        // Assign permissions (base matrix)
        $admin->syncPermissions($permissions);

        $chefPerms = [
            'portfolios.view', 'clients.view', 'clients.edit',
            'tasks.manage', 'tasks.update', 'time.approve',
            'reports.view', 'exports.view', 'requests.view',
        ];
        $chef->syncPermissions($chefPerms);

        $collabPerms = [
            'clients.view', 'tasks.update',
        ];
        $collab->syncPermissions($collabPerms);

        $assistantPerms = [
            'clients.view', 'requests.manage', 'requests.view',
        ];
        $assistant->syncPermissions($assistantPerms);
    }
}
