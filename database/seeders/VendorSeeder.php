<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vendor;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            ['name' => 'PT. Tech Supplies'],
            ['name' => 'CV. Gadget Store'],
            ['name' => 'PT. Auto Fleet'],
            ['name' => 'CV. Mobile Partner'],
        ];

        foreach ($vendors as $v) {
            Vendor::firstOrCreate(['name' => $v['name']]);
        }

        $this->command->info('Vendors seeded successfully.');
    }
}
