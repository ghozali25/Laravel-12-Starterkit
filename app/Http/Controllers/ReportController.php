<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Exports\EmployeesExport;
use App\Exports\AssetsExport;
use App\Exports\TicketsExport;
use App\Models\User;
use App\Models\Asset;
use App\Models\Ticket;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('reports/index');
    }

    public function export(Request $request, string $type, string $format)
    {
        $format = strtolower($format);
        $fileBase = 'report_' . $type . '_' . now()->format('Ymd_His');

        switch ($type) {
            case 'employees':
                $employees = User::with(['roles', 'division'])
                    ->whereHas('roles', function ($q) {
                        $q->where('name', '!=', 'admin');
                    })->get();
                $export = new EmployeesExport($employees);
                break;
            case 'assets':
                $assets = Asset::with(['category', 'user'])->get();
                $export = new AssetsExport($assets);
                break;
            case 'tickets':
                $tickets = Ticket::with(['user', 'assignedUser'])->get();
                $export = new TicketsExport($tickets);
                break;
            default:
                abort(404);
        }

        if ($format === 'csv') {
            return Excel::download($export, $fileBase . '.csv', \Maatwebsite\Excel\Excel::CSV);
        } elseif ($format === 'xlsx' || $format === 'excel') {
            return Excel::download($export, $fileBase . '.xlsx');
        } else {
            abort(400, 'Unsupported format');
        }
    }
}
