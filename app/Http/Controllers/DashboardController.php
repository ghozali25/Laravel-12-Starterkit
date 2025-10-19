<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User; // Import User model

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = $request->user();

        // Pastikan pengguna terautentikasi sebelum mengakses ID-nya
        if (!$user) {
            return redirect()->route('login'); // Atau abort(403) jika ini seharusnya tidak terjadi
        }

        $dashboardConfig = DashboardWidget::where('user_id', $user->id)->first();

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

        // Pastikan pengguna terautentikasi sebelum mengakses ID-nya
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401); // Atau tangani sesuai kebutuhan
        }

        DashboardWidget::updateOrCreate(
            ['user_id' => $user->id],
            ['widgets_data' => $request->input('widgets_data')]
        );

        return response()->json(['message' => 'Dashboard layout saved successfully.']);
    }
}