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
                'employee-assign-division', // New permission for assigning divisions
            ],
            'Divisions' => [ // New group for divisions
                'division-view',
                'division-create',
                'division-edit',
                'division-delete',
            ],
            'Assets' => [ // New group for assets
                'asset-view', // Main permission for Assets menu
                'asset-create',
                'asset-edit',
                'asset-delete',
                'asset-export', // New permission
                'asset-import', // New permission
                'asset-category-view',
                'asset-category-create',
                'asset-category-edit',
                'asset-category-delete',
                'brand-view', // New permission for brands
                'brand-create', // New permission for brands
                'brand-edit', // New permission for brands
                'brand-delete', // New permission for brands
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
                    } elseif ($name === 'employee-create' || $name === 'employee-edit' || $name === 'employee-delete' || $name === 'employee-import' || $name === 'employee-assign-manager' || $name === 'employee-assign-division') {
                        // Manager can create, edit, delete, import, assign manager, assign division
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                        // Leader can edit their direct reports, but not assign managers or divisions
                        if ($name === 'employee-edit' && !$leader->hasPermissionTo($permission)) $leader->givePermissionTo($permission);
                    }
                }
                // Assign division permissions
                if (str_starts_with($name, 'division-')) {
                    if ($name === 'division-view') {
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                        if (!$leader->hasPermissionTo($permission)) $leader->givePermissionTo($permission);
                    }
                    // Only admin can create, edit, delete divisions by default
                }
                // Assign asset category permissions
                if (str_starts_with($name, 'asset-category-')) {
                    if ($name === 'asset-category-view') {
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                    }
                    // Only admin can create, edit, delete asset categories by default
                }
                // Assign asset permissions
                if (str_starts_with($name, 'asset-')) {
                    if ($name === 'asset-view' || $name === 'asset-export') { // Added asset-export
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                        if (!$leader->hasPermissionTo($permission)) $leader->givePermissionTo($permission);
                        if (!$staff->hasPermissionTo($permission)) $staff->givePermissionTo($permission);
                    } elseif ($name === 'asset-create' || $name === 'asset-edit' || $name === 'asset-delete' || $name === 'asset-import') { // Added asset-import
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                    }
                }
                // Assign brand permissions
                if (str_starts_with($name, 'brand-')) {
                    if ($name === 'brand-view') {
                        if (!$manager->hasPermissionTo($permission)) $manager->givePermissionTo($permission);
                    }
                    // Only admin can create, edit, delete brands by default
                }
            }
        }
    }
}