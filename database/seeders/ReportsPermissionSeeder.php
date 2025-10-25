<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\Menu;

class ReportsPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permission if not exists
        $perm = Permission::firstOrCreate(['name' => 'view reports'], ['guard_name' => 'web']);

        // Attach to roles admin and it_support if they exist
        foreach (['admin', 'it_support'] as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->givePermissionTo($perm);
            }
        }

        // Create Reports menu if not exists (by route)
        if (!Menu::where('route', '/reports')->exists()) {
            // Place it at the end
            $maxOrder = (int) Menu::max('order');
            Menu::create([
                'title' => 'Reports',
                'icon' => 'FileBarChart',
                'route' => '/reports',
                'parent_id' => null,
                'permission_name' => 'view reports',
                'is_enabled' => true,
                'order' => $maxOrder + 1,
            ]);
        }
    }
}
