<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DivisionSeeder::class, // Panggil DivisionSeeder pertama
            RolePermissionSeeder::class,
            MenuSeeder::class,
        ]);

        // Pastikan admin user dibuat dan diberi peran admin
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin123'),
        ]);
        $admin->assignRole('admin');

        // Panggil seeder tambahan untuk user, manager, dan leader
        $this->call([
            AdditionalUserSeeder::class,
        ]);
    }
}