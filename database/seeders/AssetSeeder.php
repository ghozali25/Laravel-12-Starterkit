<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\User;
use App\Models\Brand; // Import Brand model
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class AssetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = AssetCategory::all();
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin'); // Hanya ambil user non-admin
        })->get();

        if ($categories->isEmpty()) {
            $this->command->info('No asset categories found. Please run AssetCategorySeeder first or create categories manually.');
            return;
        }

        $this->command->info('Seeding example assets...');

        foreach ($categories as $category) {
            // Get brands associated with this category
            $availableBrands = $category->brands;

            for ($i = 1; $i <= 2; $i++) { // Buat 2 aset per kategori
                $employee = $employees->random(); // Pilih karyawan secara acak
                $isAssigned = (bool) random_int(0, 1); // Acak apakah aset ditugaskan atau tidak
                $selectedBrand = $availableBrands->isNotEmpty() ? $availableBrands->random()->name : fake()->company(); // Pick a random brand or use faker

                $assetData = [
                    'asset_category_id' => $category->id,
                    'user_id' => $isAssigned ? $employee->id : null,
                    'serial_number' => 'SN-' . strtoupper(substr($category->name, 0, 3)) . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT) . '-' . $i,
                    'brand' => $selectedBrand, // Use selected brand
                    'model' => fake()->word() . ' ' . fake()->randomNumber(3, true),
                    'purchase_date' => Carbon::now()->subYears(rand(0, 3))->subMonths(rand(0, 11))->format('Y-m-d'),
                    'warranty_end_date' => Carbon::now()->addYears(rand(0, 2))->addMonths(rand(0, 11))->format('Y-m-d'),
                    'status' => $isAssigned ? 'assigned' : 'available',
                    'notes' => fake()->sentence(),
                    'last_used_at' => $isAssigned ? Carbon::now()->subDays(rand(1, 30)) : null,
                ];

                // Handle custom fields dynamically
                $customFieldsData = [];
                if ($category->custom_fields_schema) {
                    foreach ($category->custom_fields_schema as $fieldKey => $fieldDef) {
                        if ($fieldDef['type'] === 'text') {
                            $customFieldsData[$fieldKey] = fake()->word();
                        } elseif ($fieldDef['type'] === 'number') {
                            $customFieldsData[$fieldKey] = fake()->randomNumber(2, false);
                        }
                        // Tambahkan lebih banyak tipe field jika diperlukan
                    }
                }
                $assetData['custom_fields_data'] = $customFieldsData;

                Asset::create($assetData);
            }
        }

        $this->command->info('Example assets seeded successfully.');
    }
}