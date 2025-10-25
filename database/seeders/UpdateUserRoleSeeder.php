<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UpdateUserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find all users with 'user' role and change to 'staff'
        $users = User::whereHas('roles', function($q) {
            $q->where('name', 'user');
        })->get();

        $this->command->info('Found ' . $users->count() . ' users with user role');

        foreach($users as $user) {
            $user->removeRole('user');
            $user->assignRole('staff');
            $this->command->info('Updated user: ' . $user->name);
        }

        $this->command->info('All users updated to staff role!');
    }
}
