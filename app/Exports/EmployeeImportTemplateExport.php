<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class EmployeeImportTemplateExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        // Return a collection with one example row to guide users filling the template
        return new Collection([
            [
                'nama_karyawan'   => 'Leader 2',
                'email_perusahaan'=> 'leader2@bach-project.com',
                'nik'             => '1234567890',
                'email_pribadi'   => 'leader2.personal@example.com',
                'no_telepon'      => '+6282123456789',
                'alamat'          => 'Jl. Contoh No. 123, Jakarta',
                'divisi'          => 'Build To Suit',
                'roles'           => 'leader',
            ],
        ]);
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