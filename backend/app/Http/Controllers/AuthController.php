<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AuthController extends Controller
{
    // POST /login
    public function login(LoginRequest $request)
    {
        try {
            $credentials = $request->validated();

            /** @var User|null $user */
            $user = User::where('email', $credentials['email'])->first();
            if (! $user || ! Hash::check($credentials['password'], $user->password)) {
                return response()->json(['message' => 'Invalid credentials'], 422);
            }

            Auth::login($user, remember: false);

            $request->session()->regenerate();

            return response()->json(['message' => 'Logged in']);
        } catch (\Throwable $e) {
            Log::error('Login failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Login failed', 'error' => config('app.debug') ? $e->getMessage() : null], 500);
        }
    }

    // GET /user
    public function user(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        if (! $user) {
            return response()->json(null, 200);
        }

        // If using Spatie roles/permissions, include them (safely)
        try {
            $roles = method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [];
            $permissions = method_exists($user, 'getAllPermissions') ? $user->getAllPermissions()->pluck('name') : [];
        } catch (\Throwable $e) {
            Log::warning('Failed to load roles/permissions', ['error' => $e->getMessage()]);
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

    // POST /logout
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out']);
    }
}
