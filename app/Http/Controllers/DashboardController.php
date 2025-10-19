<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
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

        $user = $request->user();
        DashboardWidget::updateOrCreate(
            ['user_id' => $user->id],
            ['widgets_data' => $request->input('widgets_data')]
        );

        return response()->json(['message' => 'Dashboard layout saved successfully.']);
    }
}