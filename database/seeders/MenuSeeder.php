<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use Spatie\Permission\Models\Permission;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan tabel permissions sudah terisi dari RolePermissionSeeder
        // Hapus semua menu yang ada untuk menghindari duplikasi saat seeding ulang
        Menu::truncate();

        // Dashboard
        Menu::create([
            'title' => 'Dashboard',
            'icon' => 'LayoutGrid',
            'route' => '/dashboard',
            'order' => 1,
            'permission_name' => 'dashboard-view',
        ]);

        // Employees (Sekarang menjadi menu tingkat atas)
        Menu::create([
            'title' => 'Employees',
            'icon' => 'Briefcase',
            'route' => '/employees',
            'parent_id' => null, // Penting: Set ke null untuk menjadi menu tingkat atas
            'order' => 2, // Urutan setelah Dashboard
            'permission_name' => 'employee-view', // Pastikan permission ini ada
        ]);

        // IT Support Tickets (Menu tingkat atas)
        Menu::create([
            'title' => 'IT Support',
            'icon' => 'Headphones',
            'route' => '/tickets',
            'parent_id' => null,
            'order' => 3, // Urutan setelah Employees
            'permission_name' => 'ticket-view',
        ]);

        // Access Management (Parent Menu) - Urutan disesuaikan
        $accessMenu = Menu::create([
            'title' => 'Access',
            'icon' => 'ShieldCheck',
            'route' => null,
            'order' => 4, // Urutan setelah IT Support
            'permission_name' => 'access-view',
        ]);

        // Sub-menu untuk Access
        Menu::create([
            'title' => 'Users',
            'icon' => 'Users',
            'route' => '/users',
            'parent_id' => $accessMenu->id,
            'order' => 1,
            'permission_name' => 'users-view',
        ]);
        Menu::create([
            'title' => 'Roles',
            'icon' => 'UserCog',
            'route' => '/roles',
            'parent_id' => $accessMenu->id,
            'order' => 2,
            'permission_name' => 'roles-view',
        ]);
        Menu::create([
            'title' => 'Permissions',
            'icon' => 'Key',
            'route' => '/permissions',
            'parent_id' => $accessMenu->id,
            'order' => 3,
            'permission_name' => 'permission-view',
        ]);
        Menu::create([ // New menu for Divisions
            'title' => 'Divisions',
            'icon' => 'Building2', // Using Building2 icon for divisions
            'route' => '/divisions',
            'parent_id' => $accessMenu->id,
            'order' => 4,
            'permission_name' => 'division-view',
        ]);

        // Asset Management (Parent Menu)
        $assetMenu = Menu::create([
            'title' => 'Assets',
            'icon' => 'Package', // Using Package icon for assets
            'route' => null,
            'order' => 5, // Urutan setelah Access
            'permission_name' => 'asset-view', // Placeholder permission for main asset menu
        ]);

        // Sub-menu untuk Asset Management
        Menu::create([
            'title' => 'Asset Categories',
            'icon' => 'Tags', // Using Tags icon for asset categories
            'route' => '/asset-categories',
            'parent_id' => $assetMenu->id,
            'order' => 1,
            'permission_name' => 'asset-category-view',
        ]);
        Menu::create([ // New menu for Assets List
            'title' => 'Assets List',
            'icon' => 'Laptop', // Using Laptop icon for assets list
            'route' => '/assets',
            'parent_id' => $assetMenu->id,
            'order' => 2,
            'permission_name' => 'asset-view',
        ]);
        Menu::create([ // New menu for Brands
            'title' => 'Brands',
            'icon' => 'Trademark', // Using Trademark icon for brands
            'route' => '/brands',
            'parent_id' => $assetMenu->id,
            'order' => 3,
            'permission_name' => 'brand-view',
        ]);
        Menu::create([ // New menu for Locations
            'title' => 'Locations',
            'icon' => 'MapPin', // Using MapPin icon for locations
            'route' => '/locations',
            'parent_id' => $assetMenu->id,
            'order' => 4,
            'permission_name' => 'asset-view', // Reuse asset permission for visibility
        ]);

        // Settings (Parent Menu) - Urutan disesuaikan
        $settingsMenu = Menu::create([
            'title' => 'Settings',
            'icon' => 'Settings',
            'route' => null,
            'order' => 6, // Urutan setelah Assets
            'permission_name' => 'settings-view',
        ]);

        // Sub-menu untuk Settings
        Menu::create([
            'title' => 'Menu Management',
            'icon' => 'List',
            'route' => '/menus',
            'parent_id' => $settingsMenu->id,
            'order' => 1,
            'permission_name' => 'menu-view',
        ]);
        Menu::create([
            'title' => 'App Settings',
            'icon' => 'Settings',
            'route' => '/settingsapp',
            'parent_id' => $settingsMenu->id,
            'order' => 2,
            'permission_name' => 'app-settings-view',
        ]);
        Menu::create([
            'title' => 'Backup',
            'icon' => 'HardDrive',
            'route' => '/backup',
            'parent_id' => $settingsMenu->id,
            'order' => 3,
            'permission_name' => 'backup-view',
        ]);

        // Utilities (Parent Menu) - Urutan disesuaikan
        $utilitiesMenu = Menu::create([
            'title' => 'Utilities',
            'icon' => 'Tool',
            'route' => null,
            'order' => 7, // Urutan setelah Settings
            'permission_name' => 'utilities-view',
        ]);

        // Sub-menu untuk Utilities
        Menu::create([
            'title' => 'Audit Log',
            'icon' => 'ClipboardList',
            'route' => '/audit-logs',
            'parent_id' => $utilitiesMenu->id,
            'order' => 1,
            'permission_name' => 'log-view',
        ]);
        Menu::create([
            'title' => 'File Manager',
            'icon' => 'Folder',
            'route' => '/files',
            'parent_id' => $utilitiesMenu->id,
            'order' => 2,
            'permission_name' => 'filemanager-view',
        ]);
    }
}