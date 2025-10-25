<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Division; // Import Division model
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
        $staffRole = Role::firstOrCreate(['name' => 'staff']); // Changed from 'user' to 'staff'
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $leaderRole = Role::firstOrCreate(['name' => 'leader']);

        // Ambil semua divisi yang ada
        $divisions = Division::all();

        // Create 10 regular staff
        for ($i = 1; $i <= 10; $i++) {
            $staff = User::firstOrCreate(
                ['email' => 'staff' . $i . '@bach-project.com'], // Changed from 'user' to 'staff'
                [
                    'name' => 'Staff ' . $i, // Changed from 'User' to 'Staff'
                    'password' => Hash::make('password'),
                    'division_id' => $divisions->random()->id, // Assign random division
                ]
            );
            $staff->assignRole($staffRole); // Changed from $user to $staff
        }

        // Create 3 managers
        for ($i = 1; $i <= 3; $i++) {
            $manager = User::firstOrCreate(
                ['email' => 'manager' . $i . '@bach-project.com'],
                [
                    'name' => 'Manager ' . $i,
                    'password' => Hash::make('password'),
                    'division_id' => $divisions->random()->id, // Assign random division
                ]
            );
            $manager->assignRole($managerRole);
        }

        // Create 2 leaders
        for ($i = 1; $i <= 2;  $i++) {
            $leader = User::firstOrCreate(
                ['email' => 'leader' . $i . '@bach-project.com'],
                [
                    'name' => 'Leader ' . $i,
                    'password' => Hash::make('password'),
                    'division_id' => $divisions->random()->id, // Assign random division
                ]
            );
            $leader->assignRole($leaderRole);
        }
    }
}