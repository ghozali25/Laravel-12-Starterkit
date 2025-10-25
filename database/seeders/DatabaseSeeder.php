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
            DivisionSeeder::class,
            RolePermissionSeeder::class,
            MenuSeeder::class,
            AssetCategorySeeder::class, // Pastikan kategori aset sudah ada
            BrandSeeder::class, // Add BrandSeeder here
            SettingAppSeeder::class, // Add SettingAppSeeder here
        ]);

        // Create or retrieve the admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'], // Check if user with this email already exists
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(), // Ensure email is verified for admin
            ]
        );
        $admin->assignRole('admin');

        // Panggil seeder tambahan untuk user, manager, dan leader
        // Ini harus berjalan sebelum AssetSeeder agar ada karyawan yang tersedia
        $this->call([
            AdditionalUserSeeder::class,
        ]);

        // Panggil AssetSeeder setelah kategori aset dan karyawan sudah ada
        $this->call([
            AssetSeeder::class,
        ]);

        // Panggil TicketSeeder setelah user sudah ada
        $this->call([
            TicketSeeder::class,
        ]);
    }
}