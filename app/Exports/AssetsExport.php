<?php

namespace App\Exports;

use App\Models\Asset;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AssetsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $assets;

    public function __construct(Collection $assets)
    {
        $this->assets = $assets;
    }

    public function collection()
    {
        return $this->assets;
    }

    public function headings(): array
    {
        return [
            'Kategori Aset',
            'Serial Number',
            'Brand',
            'Model',
            'Tanggal Pembelian',
            'Tanggal Akhir Garansi',
            'Status',
            'Ditugaskan Kepada',
            'Catatan',
            'Data Kustom (JSON)',
        ];
    }

    public function map($asset): array
    {
        return [
            $asset->category->name ?? '-',
            $asset->serial_number,
            $asset->brand,
            $asset->model,
            $asset->purchase_date ? $asset->purchase_date->format('Y-m-d') : '-',
            $asset->warranty_end_date ? $asset->warranty_end_date->format('Y-m-d') : '-',
            $asset->status,
            $asset->user->name ?? '-',
            $asset->notes,
            json_encode($asset->custom_fields_data),
        ];
    }
}