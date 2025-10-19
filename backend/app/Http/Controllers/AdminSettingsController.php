<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminSettingsController extends Controller
{
    // GET /roles-permissions
    public function index()
    {
        Gate::authorize('users.edit');
        $roles = Role::query()->orderBy('name')->get(['id','name']);
        $perms = Permission::query()->orderBy('name')->get(['id','name']);

        $matrix = [];
        foreach ($roles as $role) {
            $matrix[$role->name] = $role->permissions()->pluck('name')->toArray();
        }

        return response()->json([
            'roles' => $roles,
            'permissions' => $perms,
            'matrix' => $matrix,
        ]);
    }

    // PUT /roles/{role}/permissions { permissions: string[] }
    public function updateRolePermissions(Request $request, Role $role)
    {
        Gate::authorize('users.edit');
        $data = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string','exists:permissions,name']
        ]);
        $names = $data['permissions'] ?? [];
        $permissions = Permission::whereIn('name', $names)->get();
        $role->syncPermissions($permissions);
        return response()->json(['message' => 'updated']);
    }
}
