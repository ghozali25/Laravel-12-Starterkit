<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AssetImportTemplateExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return new Collection([]);
    }

    public function headings(): array
    {
        return [
            'kategori_aset', // Nama kategori, bukan ID
            'serial_number',
            'brand',
            'model',
            'purchase_date', // Format YYYY-MM-DD
            'warranty_end_date', // Format YYYY-MM-DD
            'status', // available, assigned, in_repair, retired
            'email_karyawan', // Email karyawan yang ditugaskan
            'notes',
            'custom_fields_data', // JSON string
        ];
    }
}