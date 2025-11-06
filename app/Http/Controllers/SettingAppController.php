<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\SettingApp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Import Storage facade

class SettingAppController extends Controller
{
    public function edit()
    {
        $setting = SettingApp::first();
        return Inertia::render('settingapp/Form', ['setting' => $setting]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nama_app'   => 'required|string|max:255',
            'deskripsi'  => 'nullable|string',
            'logo'       => 'nullable|file|image|max:2048',
            'favicon'    => 'nullable|file|image|max:1024',
            'warna'      => 'nullable|string|max:20',
            'seo'        => 'nullable|array',
            'background_image' => 'nullable|file|image|max:2048',
            'remove_background_image' => 'boolean',
            'registration_enabled' => 'required|boolean',
            // Backup schedule fields
            'backup_schedule_frequency' => 'nullable|in:off,daily,weekly,monthly',
            'backup_schedule_time' => 'nullable|date_format:H:i',
            'backup_schedule_weekday' => 'nullable|integer|min:0|max:6',
            'backup_schedule_monthday' => 'nullable|integer|min:1|max:31',
        ]);

        $setting = SettingApp::firstOrNew();

        // Handle Logo
        if ($request->hasFile('logo')) {
            if ($setting->logo) {
                Storage::disk('public')->delete($setting->logo);
            }
            $data['logo'] = $request->file('logo')->store('logo', 'public');
        } else {
            unset($data['logo']);
        }

        // Handle Favicon
        if ($request->hasFile('favicon')) {
            if ($setting->favicon) {
                Storage::disk('public')->delete($setting->favicon);
            }
            $data['favicon'] = $request->file('favicon')->store('favicon', 'public');
        } else {
            unset($data['favicon']);
        }

        // Handle Background Image
        if ($request->hasFile('background_image')) {
            if ($setting->background_image) {
                Storage::disk('public')->delete($setting->background_image);
            }
            $data['background_image'] = $request->file('background_image')->store('backgrounds', 'public');
        } elseif ($request->input('remove_background_image') && $setting->background_image) {
            // Jika ada permintaan untuk menghapus dan gambar memang ada
            Storage::disk('public')->delete($setting->background_image);
            $data['background_image'] = null; // Set ke null di database
        } else {
            unset($data['background_image']); // Jangan update jika tidak ada file baru dan tidak ada permintaan hapus
        }

        // Normalize backup schedule defaults
        if (!isset($data['backup_schedule_frequency'])) { $data['backup_schedule_frequency'] = 'off'; }
        if (!isset($data['backup_schedule_time'])) { $data['backup_schedule_time'] = '00:30'; }
        if (($data['backup_schedule_frequency'] ?? 'off') !== 'weekly') {
            $data['backup_schedule_weekday'] = null;
        }
        if (($data['backup_schedule_frequency'] ?? 'off') !== 'monthly') {
            $data['backup_schedule_monthday'] = null;
        }

        $setting->fill($data)->save();

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}