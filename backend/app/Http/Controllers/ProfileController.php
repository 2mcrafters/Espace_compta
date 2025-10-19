<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\ChangePasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return $this->userPayload($request->user());
    }

    public function update(UpdateProfileRequest $request)
    {
        try {
            $user = $request->user();
            $data = $request->validated();
            $user->fill($data);
            $user->save();
            return $this->userPayload($user);
        } catch (\Throwable $e) {
            Log::error('Profile update failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Profile update failed'], 500);
        }
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        try {
            $user = $request->user();
            $data = $request->validated();
            // Verify current password
            if (! Hash::check($data['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }
            $user->password = Hash::make($data['password']);
            $user->save();
            return response()->json(['message' => 'Password changed']);
        } catch (\Throwable $e) {
            Log::error('Password change failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Password change failed'], 500);
        }
    }

    protected function userPayload($user)
    {
        if (! $user) return response()->json(null);

        // Include roles/permissions when available
        try {
            $roles = method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [];
            $permissions = method_exists($user, 'getAllPermissions') ? $user->getAllPermissions()->pluck('name') : [];
        } catch (\Throwable $e) {
            $roles = [];
            $permissions = [];
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => array_values($roles instanceof \Illuminate\Support\Collection ? $roles->toArray() : (array) $roles),
            'permissions' => array_values($permissions instanceof \Illuminate\Support\Collection ? $permissions->toArray() : (array) $permissions),
        ]);
    }
}
