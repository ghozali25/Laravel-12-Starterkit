<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Division; // Import Division model
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithBatchInserts;

class EmployeesImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure, WithChunkReading, WithBatchInserts
{
    use SkipsFailures;

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (empty($row['email_perusahaan'])) {
                continue;
            }

            $user = User::firstOrNew(['email' => $row['email_perusahaan']]);

            // Temukan atau buat divisi
            $divisionId = null;
            if (!empty($row['divisi'])) {
                $division = Division::firstOrCreate(['name' => trim($row['divisi'])]);
                $divisionId = $division->id;
            }

            $user->fill([
                'name' => $row['nama_karyawan'],
                'nik' => $row['nik'],
                'personal_email' => $row['email_pribadi'],
                'phone_number' => $row['no_telepon'],
                'address' => $row['alamat'],
                'division_id' => $divisionId, // Simpan division_id
            ]);

            if (!$user->exists) {
                $user->password = Hash::make('password');
            }
            $user->save();

            if (!empty($row['roles'])) {
                $roles = explode(',', $row['roles']);
                $roleNames = array_map('trim', $roles);
                $validRoles = Role::whereIn('name', $roleNames)->pluck('name')->toArray();
                $user->syncRoles($validRoles);
            } else {
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
            '*.no_telepon' => ['nullable', 'string', 'max:20'],
            '*.alamat' => ['nullable', 'string'],
            '*.divisi' => ['nullable', 'string', 'exists:divisions,name'], // Validasi divisi
            '*.roles' => ['nullable', 'string'],
        ];
    }

    public function customValidationMessages()
    {
        return [
            '*.email_perusahaan.unique' => 'Email perusahaan :input sudah digunakan.',
            '*.nik.unique' => 'NIK :input sudah digunakan.',
            '*.divisi.exists' => 'Divisi :input tidak ditemukan. Pastikan divisi sudah ada di sistem.',
        ];
    }

    public function prepareForValidation($data, $index)
    {
        if (isset($data['no_telepon']) && !is_string($data['no_telepon'])) {
            $data['no_telepon'] = (string) $data['no_telepon'];
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