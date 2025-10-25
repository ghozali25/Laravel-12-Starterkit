<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Asset; // Import Asset model
use App\Models\AssetCategory; // Import AssetCategory model
use App\Models\Division; // Import Division model
use App\Models\Ticket; // Import Ticket model
use App\Models\TicketComment; // Import TicketComment model
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
        $totalDivisions = Division::count(); // New: Total Divisions
        $totalAssetCategories = AssetCategory::count(); // New: Total Asset Categories
        $totalAssets = Asset::count(); // New: Total Assets
        
        // --- Ticket Data ---
        $totalTickets = Ticket::count();
        $openTickets = Ticket::where('status', 'open')->count();
        $inProgressTickets = Ticket::where('status', 'in_progress')->count();
        $resolvedTickets = Ticket::where('status', 'resolved')->count();
        $urgentTickets = Ticket::where('priority', 'urgent')->count();
        $highPriorityTickets = Ticket::where('priority', 'high')->count();

        // Total Backups (similar logic to BackupController)
        $realBackupPath = storage_path('app/' . $this->backupPath);
        $totalBackups = File::exists($realBackupPath) ? count(File::files($realBackupPath)) : 0;

        // Monthly Data for Charts (Users, Backups, Assets)
        $months = collect([]);
        for ($i = 5; $i >= 0; $i--) { // Last 6 months
            $months->push(Carbon::now()->subMonths($i)->startOfMonth());
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

        $monthlyBackups = collect([]);
        if (File::exists($realBackupPath)) {
            $backupFiles = File::files($realBackupPath);
            foreach ($backupFiles as $file) {
                $month = Carbon::createFromTimestamp($file->getMTime())->format('M Y');
                $monthlyBackups[$month] = ($monthlyBackups[$month] ?? 0) + 1;
            }
        }

        $monthlyAssetsCreated = Asset::select(
                DB::raw('DATE_FORMAT(created_at, "%b %Y") as month'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthlyData = $months->map(function ($monthDate) use ($monthlyUsers, $monthlyBackups, $monthlyAssetsCreated) {
            $monthKey = $monthDate->format('M Y');
            return [
                'name' => $monthKey,
                'Users' => $monthlyUsers[$monthKey]['count'] ?? 0,
                'Backups' => $monthlyBackups[$monthKey] ?? 0,
                'Assets' => $monthlyAssetsCreated[$monthKey]['count'] ?? 0, // New: Monthly Assets
            ];
        })->values();


        // User Role Distribution
        $userRoleDistribution = Role::withCount('users')
            ->get()
            ->map(function ($role) {
                $colors = [
                    'admin' => '#fbbf24', // yellow-400
                    'staff' => '#f87171',   // red-400
                    'manager' => '#60a5fa', // blue-400
                    'leader' => '#34d399',  // emerald-400
                    'it_support' => '#a78bfa',  // purple-400
                ];
                return [
                    'name' => $role->name,
                    'value' => $role->users_count,
                    'color' => $colors[$role->name] ?? '#cccccc', // Default color if not found
                ];
            })->toArray();

        // Asset Category Distribution (Pie Chart)
        $assetCategoryDistribution = AssetCategory::withCount('assets')
            ->get()
            ->map(function ($category) {
                // Generate a consistent color based on category name hash, or use a predefined list
                $colors = [
                    'Laptop' => '#ef4444', // red-500
                    'Mobile Phone' => '#f97316', // orange-500
                    'Vehicle' => '#eab308', // yellow-500
                    'Monitor' => '#22c55e', // green-500
                    // Add more as needed
                ];
                return [
                    'name' => $category->name,
                    'value' => $category->assets_count,
                    'color' => $colors[$category->name] ?? '#' . substr(md5($category->name), 0, 6), // Dynamic color
                ];
            })->toArray();

        // Asset Status Distribution (Pie Chart)
        $assetStatusDistribution = Asset::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($status) {
                $colors = [
                    'available' => '#22c55e', // green-500
                    'assigned' => '#3b82f6',  // blue-500
                    'in_repair' => '#f97316', // orange-500
                    'retired' => '#ef4444',   // red-500
                ];
                return [
                    'name' => ucfirst($status->status),
                    'value' => $status->count,
                    'color' => $colors[$status->status] ?? '#cccccc',
                ];
            })->toArray();

        // Ticket Status Distribution (Pie Chart)
        $ticketStatusDistribution = Ticket::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($status) {
                $colors = [
                    'open' => '#ef4444',     // red-500
                    'in_progress' => '#f97316', // orange-500
                    'resolved' => '#22c55e',   // green-500
                    'closed' => '#6b7280',     // gray-500
                    'cancelled' => '#9ca3af',  // gray-400
                ];
                return [
                    'name' => ucfirst(str_replace('_', ' ', $status->status)),
                    'value' => $status->count,
                    'color' => $colors[$status->status] ?? '#cccccc',
                ];
            })->toArray();

        // Ticket Priority Distribution (Pie Chart)
        $ticketPriorityDistribution = Ticket::select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get()
            ->map(function ($priority) {
                $colors = [
                    'low' => '#22c55e',      // green-500
                    'medium' => '#3b82f6',   // blue-500
                    'high' => '#f97316',     // orange-500
                    'urgent' => '#ef4444',   // red-500
                ];
                return [
                    'name' => ucfirst($priority->priority),
                    'value' => $priority->count,
                    'color' => $colors[$priority->priority] ?? '#cccccc',
                ];
            })->toArray();

        // Ticket Category Distribution (Pie Chart)
        $ticketCategoryDistribution = Ticket::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get()
            ->map(function ($category) {
                $colors = [
                    'hardware' => '#ef4444',   // red-500
                    'software' => '#3b82f6',   // blue-500
                    'network' => '#22c55e',    // green-500
                    'email' => '#f97316',      // orange-500
                    'access' => '#8b5cf6',     // violet-500
                    'other' => '#6b7280',      // gray-500
                ];
                return [
                    'name' => ucfirst($category->category),
                    'value' => $category->count,
                    'color' => $colors[$category->category] ?? '#cccccc',
                ];
            })->toArray();


        return Inertia::render('dashboard', [
            'initialWidgets' => $dashboardConfig ? $dashboardConfig->widgets_data : [],
            'totalUsers' => $totalUsers,
            'totalBackups' => $totalBackups,
            'totalActivityLogs' => $totalActivityLogs,
            'totalDivisions' => $totalDivisions, // New
            'totalAssetCategories' => $totalAssetCategories, // New
            'totalAssets' => $totalAssets, // New
            'totalTickets' => $totalTickets, // New
            'openTickets' => $openTickets, // New
            'inProgressTickets' => $inProgressTickets, // New
            'resolvedTickets' => $resolvedTickets, // New
            'urgentTickets' => $urgentTickets, // New
            'highPriorityTickets' => $highPriorityTickets, // New
            'monthlyData' => $monthlyData,
            'userRoleDistribution' => $userRoleDistribution,
            'assetCategoryDistribution' => $assetCategoryDistribution, // New
            'assetStatusDistribution' => $assetStatusDistribution, // New
            'ticketStatusDistribution' => $ticketStatusDistribution, // New
            'ticketPriorityDistribution' => $ticketPriorityDistribution, // New
            'ticketCategoryDistribution' => $ticketCategoryDistribution, // New
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

        return redirect()->back()->with('success', 'Dashboard layout saved successfully.');
    }
}