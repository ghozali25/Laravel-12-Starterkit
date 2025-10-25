<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ITSupportUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'itsupport@admin.com'],
            [
                'name' => 'IT Support',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );
        
        $user->assignRole('it_support');
        
        $this->command->info('IT Support user created successfully!');
    }
}
