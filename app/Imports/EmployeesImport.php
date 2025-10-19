<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Maatwebsite\Excel\Concerns\WithChunkReading; // Ditambahkan
use Maatwebsite\Excel\Concerns\WithBatchInserts; // Ditambahkan

class EmployeesImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure, WithChunkReading, WithBatchInserts // Diperbarui
{
    use SkipsFailures;

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Pastikan email perusahaan ada dan unik
            if (empty($row['email_perusahaan'])) {
                continue; // Skip baris jika email perusahaan kosong
            }

            $user = User::firstOrNew(['email' => $row['email_perusahaan']]);

            $user->fill([
                'name' => $row['nama_karyawan'],
                'nik' => $row['nik'],
                'personal_email' => $row['email_pribadi'],
                'phone_number' => $row['no_telepon'],
                'address' => $row['alamat'],
            ]);

            // Jika user baru, set password default
            if (!$user->exists) {
                $user->password = Hash::make('password'); // Password default untuk user baru
            }
            $user->save();

            // Assign roles
            if (!empty($row['roles'])) {
                $roles = explode(',', $row['roles']);
                $roleNames = array_map('trim', $roles);
                $validRoles = Role::whereIn('name', $roleNames)->pluck('name')->toArray();
                $user->syncRoles($validRoles);
            } else {
                // Jika tidak ada role, assign role 'user' default
                $defaultRole = Role::firstOrCreate(['name' => 'user']);
                $user->assignRole($defaultRole);
            }
        }
    }

    public function rules(): array
    {
        return [
            '*.nama_karyawan' => ['required', 'string', 'max:255'],
            '*.email_perusahaan' => ['required', 'email', 'unique:users,email'],
            '*.nik' => ['nullable', 'string', 'unique:users,nik'],
            '*.email_pribadi' => ['nullable', 'email', 'max:255'],
            '*.no_telepon' => ['nullable', 'string', 'max:20'], // Rule ini akan bekerja setelah prepareForValidation
            '*.alamat' => ['nullable', 'string'],
            '*.roles' => ['nullable', 'string'],
        ];
    }

    public function customValidationMessages()
    {
        return [
            '*.email_perusahaan.unique' => 'Email perusahaan :input sudah digunakan.',
            '*.nik.unique' => 'NIK :input sudah digunakan.',
        ];
    }

    /**
     * Metode ini dipanggil sebelum validasi untuk setiap baris.
     * Digunakan untuk membersihkan atau mengubah format data.
     */
    public function prepareForValidation($data, $index)
    {
        // Pastikan 'no_telepon' diperlakukan sebagai string
        if (isset($data['no_telepon']) && !is_string($data['no_telepon'])) {
            $data['no_telepon'] = (string) $data['no_telepon'];
        }
        return $data;
    }

    /**
     * Tentukan ukuran chunk untuk membaca file.
     * Diperlukan oleh WithChunkReading.
     */
    public function chunkSize(): int
    {
        return 1000; // Memproses 1000 baris sekaligus
    }

    /**
     * Tentukan ukuran batch untuk insert database.
     * Diperlukan oleh WithBatchInserts.
     */
    public function batchSize(): int
    {
        return 1000; // Menyimpan 1000 record sekaligus
    }
}