<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;

class AddUtilitiesTrashMenuSeeder extends Seeder
{
    public function run(): void
    {
        // Find Utilities parent
        $utilities = Menu::whereNull('parent_id')->where('title', 'Utilities')->first();
        if (!$utilities) {
            $utilities = Menu::create([
                'title' => 'Utilities',
                'icon' => 'Tool',
                'route' => null,
                'order' => 7,
                'permission_name' => 'utilities-view',
            ]);
        }

        // Ensure Trash child exists
        Menu::firstOrCreate([
            'route' => '/utilities/trash',
            'parent_id' => $utilities->id,
        ], [
            'title' => 'Trash',
            'icon' => 'Trash2',
            'order' => 4,
            'permission_name' => 'utilities-view',
        ]);
    }
}
