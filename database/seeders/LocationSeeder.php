<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Location;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        // Create a simple site location in Karawaci
        Location::firstOrCreate(
            ['code' => 'KRW'],
            [
                'parent_id' => null,
                'type' => 'site',
                'name' => 'Karawaci',
                'address' => 'Karawaci',
                'is_active' => true,
            ]
        );
    }
}
