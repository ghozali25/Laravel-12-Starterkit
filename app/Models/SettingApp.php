<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettingApp extends Model
{
    protected $table = 'settingapp';

    protected $fillable = [
        'nama_app',
        'deskripsi',
        'logo',
        'favicon',
        'warna',
        'seo',
        'background_image',
        'registration_enabled',
        'backup_schedule_frequency',
        'backup_schedule_time',
        'backup_schedule_weekday',
        'backup_schedule_monthday',
    ];

    protected $casts = [
        'seo' => 'array',
        'registration_enabled' => 'boolean',
        'backup_schedule_weekday' => 'integer',
        'backup_schedule_monthday' => 'integer',
    ];
}