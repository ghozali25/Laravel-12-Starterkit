<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // For date manipulation

class DashboardController extends Controller
{
    protected string $backupPath = 'private/Laravel'; // Consistent with BackupController

    public function index(Request $request)
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $dashboardConfig = DashboardWidget::where('user_id', $user->id)->first();

        // --- Fetch Real Data ---
        $totalUsers = User::count();
        $totalActivityLogs = Activity::count();

        // Total Backups (similar logic to BackupController)
        $realBackupPath = storage_path('app/' . $this->backupPath);
        $totalBackups = File::exists($realBackupPath) ? count(File::files($realBackupPath)) : 0;

        // Monthly Data for Charts (Users and Backups)
        $months = collect([]);
        for ($i = 5; $i >= 0; $i--) { // Last 6 months
            $months->push(Carbon::now()->subMonths($i)->format('M Y'));
        }

        $monthlyUsers = User::select(
                DB::raw('DATE_FORMAT(created_at, "%b %Y") as month'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // For backups, we need to parse file modification times
        $monthlyBackups = collect([]);
        if (File::exists($realBackupPath)) {
            $backupFiles = File::files($realBackupPath);
            foreach ($backupFiles as $file) {
                $month = Carbon::createFromTimestamp($file->getMTime())->format('M Y');
                $monthlyBackups[$month] = ($monthlyBackups[$month] ?? 0) + 1;
            }
        }

        $monthlyData = $months->map(function ($month) use ($monthlyUsers, $monthlyBackups) {
            return [
                'name' => $month,
                'Users' => $monthlyUsers[$month]['count'] ?? 0,
                'Backups' => $monthlyBackups[$month] ?? 0,
            ];
        })->values();


        // User Role Distribution
        $userRoleDistribution = Role::withCount('users')
            ->get()
            ->map(function ($role) {
                // Assign a consistent color for each role, or generate dynamically
                $colors = [
                    'admin' => '#fbbf24', // yellow-400
                    'user' => '#a78bfa',  // purple-400
                    // Add more roles and colors as needed
                ];
                return [
                    'name' => $role->name,
                    'value' => $role->users_count,
                    'color' => $colors[$role->name] ?? '#cccccc', // Default color if not found
                ];
            })->toArray();

        return Inertia::render('dashboard', [
            'initialWidgets' => $dashboardConfig ? $dashboardConfig->widgets_data : [],
            'totalUsers' => $totalUsers,
            'totalBackups' => $totalBackups,
            'totalActivityLogs' => $totalActivityLogs,
            'monthlyData' => $monthlyData,
            'userRoleDistribution' => $userRoleDistribution,
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
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        DashboardWidget::updateOrCreate(
            ['user_id' => $user->id],
            ['widgets_data' => $request->input('widgets_data')]
        );

        return response()->json(['message' => 'Dashboard layout saved successfully.']);
    }
}