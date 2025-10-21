<?php

namespace App\Imports;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Carbon\Carbon;

class AssetsImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure, WithChunkReading, WithBatchInserts
{
    use SkipsFailures;

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (empty($row['serial_number']) && empty($row['model'])) {
                continue; // Skip rows without essential data
            }

            // Find or create asset category
            $categoryId = null;
            if (!empty($row['kategori_aset'])) {
                $category = AssetCategory::firstOrCreate(['name' => trim($row['kategori_aset'])]);
                $categoryId = $category->id;
            }

            // Find user if assigned
            $userId = null;
            if (!empty($row['email_karyawan'])) {
                $user = User::where('email', trim($row['email_karyawan']))->first();
                $userId = $user->id ?? null;
            }

            // Parse custom fields data
            $customFieldsData = [];
            if (!empty($row['custom_fields_data'])) {
                try {
                    $customFieldsData = json_decode($row['custom_fields_data'], true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $customFieldsData = []; // Invalid JSON
                    }
                } catch (\Exception $e) {
                    $customFieldsData = [];
                }
            }

            // Prepare dates
            $purchaseDate = !empty($row['purchase_date']) ? Carbon::parse($row['purchase_date']) : null;
            $warrantyEndDate = !empty($row['warranty_end_date']) ? Carbon::parse($row['warranty_end_date']) : null;

            // Determine status, default to 'available'
            $status = strtolower($row['status'] ?? 'available');
            if (!in_array($status, ['available', 'assigned', 'in_repair', 'retired'])) {
                $status = 'available';
            }

            // Set last_used_at if assigned to a user
            $lastUsedAt = ($userId && $status === 'assigned') ? Carbon::now() : null;

            Asset::updateOrCreate(
                [
                    'serial_number' => $row['serial_number'] ?? null, // Use serial_number as unique key if available
                    'model' => $row['model'] ?? null, // Fallback to model if serial_number is null
                ],
                [
                    'asset_category_id' => $categoryId,
                    'user_id' => $userId,
                    'brand' => $row['brand'],
                    'model' => $row['model'],
                    'purchase_date' => $purchaseDate,
                    'warranty_end_date' => $warrantyEndDate,
                    'status' => $status,
                    'notes' => $row['notes'],
                    'custom_fields_data' => $customFieldsData,
                    'last_used_at' => $lastUsedAt,
                ]
            );
        }
    }

    public function rules(): array
    {
        return [
            '*.kategori_aset' => ['required', 'string', 'max:255', 'exists:asset_categories,name'],
            '*.serial_number' => ['nullable', 'string', 'max:255', 'unique:assets,serial_number'],
            '*.brand' => ['nullable', 'string', 'max:255'],
            '*.model' => ['required', 'string', 'max:255'], // Model is now required
            '*.purchase_date' => ['nullable', 'date'],
            '*.warranty_end_date' => ['nullable', 'date', 'after_or_equal:purchase_date'],
            '*.status' => ['required', 'string', 'in:available,assigned,in_repair,retired'],
            '*.email_karyawan' => ['nullable', 'email', 'exists:users,email'],
            '*.notes' => ['nullable', 'string'],
            '*.custom_fields_data' => ['nullable', 'json'],
        ];
    }

    public function customValidationMessages()
    {
        return [
            '*.kategori_aset.exists' => 'Kategori aset :input tidak ditemukan. Pastikan kategori sudah ada di sistem.',
            '*.serial_number.unique' => 'Serial Number :input sudah digunakan.',
            '*.model.required' => 'Model aset wajib diisi.',
            '*.email_karyawan.exists' => 'Email karyawan :input tidak ditemukan.',
            '*.warranty_end_date.after_or_equal' => 'Tanggal akhir garansi harus setelah atau sama dengan tanggal pembelian.',
            '*.status.in' => 'Status aset tidak valid. Pilihan yang tersedia: available, assigned, in_repair, retired.',
            '*.custom_fields_data.json' => 'Data kustom harus dalam format JSON yang valid.',
        ];
    }

    public function prepareForValidation($data, $index)
    {
        // Ensure dates are in a parsable format if they come as numbers (Excel dates)
        if (isset($data['purchase_date']) && is_numeric($data['purchase_date'])) {
            $data['purchase_date'] = Carbon::createFromTimestamp(
                \PhpOffice\PhpSpreadsheet\Shared\Date::excelToTimestamp($data['purchase_date'])
            )->format('Y-m-d');
        }
        if (isset($data['warranty_end_date']) && is_numeric($data['warranty_end_date'])) {
            $data['warranty_end_date'] = Carbon::createFromTimestamp(
                \PhpOffice\PhpSpreadsheet\Shared\Date::excelToTimestamp($data['warranty_end_date'])
            )->format('Y-m-d');
        }
        return $data;
    }

    public function chunkSize(): int
    {
        return 1000;
    }

    public function batchSize(): int
    {
        return 1000;
    }
}