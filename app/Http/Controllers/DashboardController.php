<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // Import Auth facade
use App\Models\User; // Import User model

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = $request->user(); // Dapatkan objek pengguna

        // Jika pengguna tidak terautentikasi, redirect ke halaman login.
        // Middleware 'auth' seharusnya sudah menangani ini, tapi ini sebagai fallback.
        if (!$user) {
            return redirect()->route('login');
        }

        $userId = $user->id; // Akses ID dari objek User yang sudah dipastikan tidak null

        $dashboardConfig = DashboardWidget::where('user_id', $userId)->first();

        return Inertia::render('dashboard', [
            'initialWidgets' => $dashboardConfig ? $dashboardConfig->widgets_data : [],
        ]);
    }

    public function saveWidgets(Request $request)
    {
        $request->validate([
            'widgets_data' => 'required|array',
            'widgets_data.*.id' => 'required|string',
            'widgets_data.*.type' => 'required|string',
            'widgets_data.*.colSpan' => 'required|integer',
            'widgets_data.*.props' => 'nullable|array',
        ]);

        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $userId = $user->id;

        $dashboardWidget = DashboardWidget::updateOrCreate(
            ['user_id' => $userId],
            ['widgets_data' => $request->input('widgets_data')]
        );

        return redirect()->route('dashboard')->with('success', 'Dashboard layout saved successfully.');
    }
}