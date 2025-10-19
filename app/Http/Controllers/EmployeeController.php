<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EmployeesExport;
use App\Imports\EmployeesImport;
use Barryvdh\DomPDF\Facade\Pdf;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles')->whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin'); // Hanya tampilkan non-admin
        });

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('nik', 'like', '%' . $request->search . '%');
            });
        }

        $employees = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('employees/Index', [
            'employees' => $employees,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $roles = Role::where('name', '!=', 'admin')->get(); // Hanya role non-admin
        return Inertia::render('employees/Form', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'], // Email perusahaan
            'nik' => ['nullable', 'string', 'max:255', 'unique:users,nik'],
            'personal_email' => ['nullable', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'password' => ['required', 'string', 'min:6'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', Rule::exists('roles', 'name')],
        ]);

        $employee = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nik' => $validated['nik'],
            'personal_email' => $validated['personal_email'],
            'phone_number' => $validated['phone_number'],
            'address' => $validated['address'],
            'password' => Hash::make($validated['password']),
        ]);

        $employee->assignRole($validated['roles']);

        return redirect()->route('employees.index')->with('success', 'Employee berhasil dibuat.');
    }

    public function edit(User $employee)
    {
        $roles = Role::where('name', '!=', 'admin')->get();
        $employee->load('roles');
        return Inertia::render('employees/Form', [
            'employee' => $employee->only(['id', 'name', 'email', 'nik', 'personal_email', 'phone_number', 'address']),
            'roles' => $roles,
            'currentRoles' => $employee->roles->pluck('name')->toArray(),
        ]);
    }

    public function update(Request $request, User $employee)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($employee->id)],
            'nik' => ['nullable', 'string', 'max:255', Rule::unique('users', 'nik')->ignore($employee->id)],
            'personal_email' => ['nullable', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:6'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', Rule::exists('roles', 'name')],
        ]);

        $employee->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nik' => $validated['nik'],
            'personal_email' => $validated['personal_email'],
            'phone_number' => $validated['phone_number'],
            'address' => $validated['address'],
            'password' => $validated['password']
                ? Hash::make($validated['password'])
                : $employee->password,
        ]);

        $employee->syncRoles($validated['roles']);

        return redirect()->route('employees.index')->with('success', 'Employee berhasil diperbarui.');
    }

    public function destroy(User $employee)
    {
        $employee->delete();
        return redirect()->route('employees.index')->with('success', 'Employee berhasil dihapus.');
    }

    public function export(Request $request, $format)
    {
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin');
        })->get();

        if ($format === 'xlsx') {
            return Excel::download(new EmployeesExport($employees), 'employees.xlsx');
        } elseif ($format === 'csv') {
            return Excel::download(new EmployeesExport($employees), 'employees.csv', \Maatwebsite\Excel\Excel::CSV);
        } elseif ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.employees_pdf', ['employees' => $employees]);
            return $pdf->download('employees.pdf');
        }

        return redirect()->back()->with('error', 'Format ekspor tidak valid.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        Excel::import(new EmployeesImport, $request->file('file'));

        return redirect()->back()->with('success', 'Employees imported successfully.');
    }
}