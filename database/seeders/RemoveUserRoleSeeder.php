<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RemoveUserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userRole = Role::where('name', 'user')->first();
        if ($userRole) {
            $this->command->info('Found user role with ' . $userRole->users()->count() . ' users');
            $this->command->info('Deleting user role...');
            $userRole->delete();
            $this->command->info('User role deleted successfully!');
        } else {
            $this->command->info('No user role found.');
        }
    }
}
