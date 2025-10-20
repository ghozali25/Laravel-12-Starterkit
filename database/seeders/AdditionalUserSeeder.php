<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdditionalUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan roles sudah ada
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $leaderRole = Role::firstOrCreate(['name' => 'leader']);

        // Create 10 regular users
        for ($i = 1; $i <= 10; $i++) {
            $user = User::factory()->create([
                'name' => 'User ' . $i,
                'email' => 'user' . $i . '@bach-project.com',
                'password' => Hash::make('password'),
            ]);
            $user->assignRole($userRole);
        }

        // Create 3 managers
        for ($i = 1; $i <= 3; $i++) {
            $manager = User::factory()->create([
                'name' => 'Manager ' . $i,
                'email' => 'manager' . $i . '@bach-project.com',
                'password' => Hash::make('password'),
            ]);
            $manager->assignRole($managerRole);
        }

        // Create 2 leaders
        for ($i = 1; $i <= 2; $i++) {
            $leader = User::factory()->create([
                'name' => 'Leader ' . $i,
                'email' => 'leader' . $i . '@bach-project.com',
                'password' => Hash::make('password'),
            ]);
            $leader->assignRole($leaderRole);
        }
    }
}