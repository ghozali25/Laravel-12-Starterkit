<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EmployeeImportTemplateExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        // Return an empty collection as this is a template
        return new Collection([]);
    }

    public function headings(): array
    {
        return [
            'nama_karyawan',
            'email_perusahaan',
            'nik',
            'email_pribadi',
            'no_telepon',
            'alamat',
            'divisi', // Tambahkan ini
            'roles', // Contoh: user, editor (pisahkan dengan koma)
        ];
    }
}