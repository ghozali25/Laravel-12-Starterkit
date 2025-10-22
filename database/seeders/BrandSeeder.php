<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\AssetCategory;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $laptopBrands = ['HP', 'Lenovo', 'Thinkpad', 'Dell', 'Asus', 'Acer', 'Apple'];
        $mobilePhoneBrands = ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'];
        $vehicleBrands = ['Honda', 'Toyota', 'Suzuki', 'Mitsubishi', 'Nissan', 'Mercedes-Benz', 'BMW'];
        $monitorBrands = ['Dell', 'HP', 'Samsung', 'LG', 'Asus'];

        foreach ($laptopBrands as $name) {
            Brand::firstOrCreate(['name' => $name]);
        }
        foreach ($mobilePhoneBrands as $name) {
            Brand::firstOrCreate(['name' => $name]);
        }
        foreach ($vehicleBrands as $name) {
            Brand::firstOrCreate(['name' => $name]);
        }
        foreach ($monitorBrands as $name) {
            Brand::firstOrCreate(['name' => $name]);
        }

        // Attach brands to categories
        $laptopCategory = AssetCategory::where('name', 'Laptop')->first();
        if ($laptopCategory) {
            $laptopCategory->brands()->sync(Brand::whereIn('name', $laptopBrands)->pluck('id'));
        }

        $mobilePhoneCategory = AssetCategory::where('name', 'Mobile Phone')->first();
        if ($mobilePhoneCategory) {
            $mobilePhoneCategory->brands()->sync(Brand::whereIn('name', $mobilePhoneBrands)->pluck('id'));
        }

        $vehicleCategory = AssetCategory::where('name', 'Vehicle')->first();
        if ($vehicleCategory) {
            $vehicleCategory->brands()->sync(Brand::whereIn('name', $vehicleBrands)->pluck('id'));
        }

        $monitorCategory = AssetCategory::where('name', 'Monitor')->first();
        if ($monitorCategory) {
            $monitorCategory->brands()->sync(Brand::whereIn('name', $monitorBrands)->pluck('id'));
        }

        $this->command->info('Brands seeded and attached to categories successfully.');
    }
}