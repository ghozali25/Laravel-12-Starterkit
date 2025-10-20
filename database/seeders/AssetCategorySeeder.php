<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AssetCategory;

class AssetCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Laptop',
                'description' => 'Laptop dan perangkat komputasi portabel.',
                'custom_fields_schema' => [
                    'processor' => ['type' => 'text', 'label' => 'Processor'],
                    'ram_gb' => ['type' => 'number', 'label' => 'RAM (GB)'],
                    'storage_gb' => ['type' => 'number', 'label' => 'Storage (GB)'],
                    'os' => ['type' => 'text', 'label' => 'Operating System'],
                ],
            ],
            [
                'name' => 'Mobile Phone',
                'description' => 'Ponsel pintar dan perangkat seluler.',
                'custom_fields_schema' => [
                    'imei' => ['type' => 'text', 'label' => 'IMEI'],
                    'storage_gb' => ['type' => 'number', 'label' => 'Storage (GB)'],
                    'color' => ['type' => 'text', 'label' => 'Color'],
                ],
            ],
            [
                'name' => 'Vehicle',
                'description' => 'Kendaraan operasional perusahaan.',
                'custom_fields_schema' => [
                    'license_plate' => ['type' => 'text', 'label' => 'License Plate'],
                    'year' => ['type' => 'number', 'label' => 'Year'],
                    'fuel_type' => ['type' => 'text', 'label' => 'Fuel Type'],
                ],
            ],
            [
                'name' => 'Monitor',
                'description' => 'Monitor dan layar tampilan.',
                'custom_fields_schema' => [
                    'size_inch' => ['type' => 'number', 'label' => 'Size (inch)'],
                    'resolution' => ['type' => 'text', 'label' => 'Resolution'],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            AssetCategory::firstOrCreate(
                ['name' => $categoryData['name']],
                [
                    'description' => $categoryData['description'],
                    'custom_fields_schema' => $categoryData['custom_fields_schema'],
                ]
            );
        }

        $this->command->info('Asset categories seeded successfully.');
    }
}