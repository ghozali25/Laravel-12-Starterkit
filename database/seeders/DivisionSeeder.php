<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Division;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            'Build To Suit',
            'Enterprise',
            'Rebuild',
        ];

        foreach ($divisions as $divisionName) {
            Division::firstOrCreate(['name' => $divisionName]);
        }
    }
}