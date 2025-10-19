<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // Define permissions
        $permissions = [
            'clients.view',
            'clients.edit',
            'tasks.manage',
            'time.approve',
            'requests.manage',
            'exports.view',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'ADMIN', 'guard_name' => 'web']);
        $chef = Role::firstOrCreate(['name' => 'CHEF_EQUIPE', 'guard_name' => 'web']);
        $collab = Role::firstOrCreate(['name' => 'COLLABORATEUR', 'guard_name' => 'web']);
        $assistant = Role::firstOrCreate(['name' => 'ASSISTANT', 'guard_name' => 'web']);

        // Assign permissions
        $admin->syncPermissions($permissions);

        $chefPerms = [
            'clients.view',
            'clients.edit',
            'tasks.manage',
            'requests.manage',
            'exports.view',
        ];
        $chef->syncPermissions($chefPerms);

        $collabPerms = [
            'clients.view',
            'tasks.manage',
        ];
        $collab->syncPermissions($collabPerms);

        $assistantPerms = [
            'clients.view',
            'requests.manage',
        ];
        $assistant->syncPermissions($assistantPerms);
    }
}
