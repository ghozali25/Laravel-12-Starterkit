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

class EmployeesImport implements ToCollection, WithHeadingRow, WithValidation, SkipsOnFailure
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
            '*.no_telepon' => ['nullable', 'string', 'max:20'],
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
}