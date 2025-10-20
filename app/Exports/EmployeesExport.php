<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EmployeesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $employees;

    public function __construct(Collection $employees)
    {
        $this->employees = $employees;
    }

    public function collection()
    {
        return $this->employees;
    }

    public function headings(): array
    {
        return [
            'NIK',
            'Nama Karyawan',
            'Email Perusahaan',
            'Email Pribadi',
            'No. Telepon',
            'Alamat',
            'Divisi', // Tambahkan ini
            'Roles',
        ];
    }

    public function map($employee): array
    {
        return [
            $employee->nik,
            $employee->name,
            $employee->email,
            $employee->personal_email,
            $employee->phone_number,
            $employee->address,
            $employee->division->name ?? '-', // Ambil nama divisi
            $employee->roles->pluck('name')->implode(', '),
        ];
    }
}