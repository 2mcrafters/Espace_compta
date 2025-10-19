<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // email => role
        $users = [
            ['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'password', 'role' => 'ADMIN'],
            ['name' => 'Chef Equipe', 'email' => 'chef@example.com', 'password' => 'password', 'role' => 'CHEF_EQUIPE'],
            ['name' => 'Collaborateur', 'email' => 'collab@example.com', 'password' => 'password', 'role' => 'COLLABORATEUR'],
            ['name' => 'Assistant', 'email' => 'assistant@example.com', 'password' => 'password', 'role' => 'ASSISTANT'],
        ];
        foreach ($users as $u) {
            $user = User::updateOrCreate(
                ['email' => $u['email']],
                ['name' => $u['name'], 'password' => Hash::make($u['password'])]
            );
            if (method_exists($user, 'assignRole')) {
                $user->syncRoles([$u['role']]);
            }
        }
    }
}
