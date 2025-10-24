<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SettingApp;

class SettingAppSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SettingApp::firstOrCreate(
            [], // Find any existing record
            [
                'nama_app' => 'Laravel Starterkit',
                'deskripsi' => 'A modern and flexible starter kit built with Laravel 12, React (Inertia.js + TypeScript), TailwindCSS, and ShadCN UI v4.',
                'logo' => null,
                'favicon' => null,
                'warna' => '#0ea5e9', // Default blue color
                'seo' => [
                    'title' => 'Laravel Starterkit - Dashboard',
                    'description' => 'Your modern dashboard application.',
                    'keywords' => 'laravel, react, inertia, dashboard, admin',
                ],
                'background_image' => null,
                'registration_enabled' => true,
            ]
        );
    }
}