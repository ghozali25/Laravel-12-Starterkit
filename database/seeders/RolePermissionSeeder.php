<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Buat role admin dan user jika belum ada
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $user = Role::firstOrCreate(['name' => 'user']);
        $manager = Role::firstOrCreate(['name' => 'manager']); // New role
        $leader = Role::firstOrCreate(['name' => 'leader']);   // New role
        $staff = Role::firstOrCreate(['name' => 'staff']);     // New role

        // Daftar permission berdasarkan menu structure
        $permissions = [
            'Dashboard' => [
                'dashboard-view',
            ],
            'Access' => [
                'access-view',
                'permission-view',
                'users-view',
                'roles-view',
            ],
            'Employees' => [ // Grup baru untuk karyawan
                'employee-view',
                'employee-create',
                'employee-edit',
                'employee-delete',
                'employee-export',
                'employee-import',
                'employee-assign-manager', // New permission for assigning managers
            ],
            'Settings' => [
                'settings-view',
                'menu-view',
                'app-settings-view',
                'backup-view',
            ],
            'Utilities' => [
                'utilities-view',
                'log-view',
                'filemanager-view',
            ],
        ];

        foreach ($permissions as $group => $perms) {
            foreach ($perms as $name) {
                $permission = Permission::firstOrCreate([
                    'name' => $name,
                    'group' => $group,
                ]);

                // Assign ke admin
                if (!$admin->hasPermissionTo($permission)) {
                    $admin->givePermissionTo($permission);
                }

                // Assign permissions to manager, leader, staff roles
                if (str_starts_with($name, 'employee-')) {
                    if ($name === 'employee-view' || $name === 'employee-export') {
                        // Manager, Leader, Staff can view and export employees
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                        if (!$leader->hasPermissionTo($permission)) $leader->givePermissionTo($permission);
                        if (!$staff->hasPermissionTo($permission)) $staff->givePermissionTo($permission);
                    } elseif ($name === 'employee-create' || $name === 'employee-edit' || $name === 'employee-delete' || $name === 'employee-import' || $name === 'employee-assign-manager') {
                        // Manager can create, edit, delete, import, assign manager
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                        // Leader can edit their direct reports, but not assign managers
                        // For simplicity, let's give leader employee-edit for now, but in real app, it would be more granular
                        if ($name === 'employee-edit' && !$leader->hasPermissionTo($permission)) $leader->givePermissionTo($permission);
                    }
                }
            }
        }
    }
}