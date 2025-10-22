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
        ]);

        // Pastikan admin user dibuat dan diberi peran admin
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin123'),
        ]);
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
    }
}