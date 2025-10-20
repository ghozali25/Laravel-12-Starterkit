<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Division; // Import Division model
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EmployeesExport;
use App\Imports\EmployeesImport;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\EmployeeImportTemplateExport;
use Maatwebsite\Excel\Validators\ValidationException;
use Maatwebsite\Excel\Validators\Failure;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'manager', 'division']) // Eager load manager and division relationships
            ->whereHas('roles', function ($q) {
                $q->where('name', '!=', 'admin'); // Hanya tampilkan non-admin
            });

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('nik', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by manager_id
        if ($request->filled('manager_id')) {
            $query->where('manager_id', $request->manager_id);
        }

        // Filter by division_id
        if ($request->filled('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        $employees = $query->latest()->paginate(10)->withQueryString();

        // Get potential managers/leaders for the filter dropdown
        $potentialManagers = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['manager', 'leader']);
        })->select('id', 'name')->get();

        // Get all divisions for the filter dropdown
        $divisions = Division::select('id', 'name')->get();

        return Inertia::render('employees/Index', [
            'employees' => $employees->through(fn ($employee) => [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'nik' => $employee->nik,
                'personal_email' => $employee->personal_email,
                'phone_number' => $employee->phone_number,
                'address' => $employee->address,
                'created_at' => $employee->created_at,
                'roles' => $employee->roles,
                'manager' => $employee->manager ? ['id' => $employee->manager->id, 'name' => $employee->manager->name] : null,
                'division' => $employee->division ? ['id' => $employee->division->id, 'name' => $employee->division->name] : null,
                'avatar_url' => $employee->getFirstMediaUrl('avatars'), // Get avatar URL
            ]),
            'filters' => $request->only('search', 'manager_id', 'division_id'),
            'potentialManagers' => $potentialManagers,
            'divisions' => $divisions, // Pass divisions to frontend
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $employee)
    {
        return redirect()->route('employees.edit', $employee)->with('info', 'Redirected to edit page for employee details.');
    }

    public function create()
    {
        $roles = Role::where('name', '!=', 'admin')->get();
        $potentialManagers = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['manager', 'leader']);
        })->select('id', 'name')->get();
        $divisions = Division::all(); // Get all divisions

        return Inertia::render('employees/Form', [
            'roles' => $roles,
            'potentialManagers' => $potentialManagers,
            'divisions' => $divisions, // Pass divisions to frontend
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'nik' => ['nullable', 'string', 'max:255', 'unique:users,nik'],
            'personal_email' => ['nullable', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'password' => ['required', 'string', 'min:6'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', Rule::exists('roles', 'name')],
            'manager_id' => ['nullable', 'exists:users,id'],
            'division_id' => ['nullable', 'exists:divisions,id'],
            'avatar' => ['nullable', 'image', 'max:2048'], // Add avatar validation
        ]);

        $employee = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nik' => $validated['nik'],
            'personal_email' => $validated['personal_email'],
            'phone_number' => $validated['phone_number'],
            'address' => $validated['address'],
            'password' => Hash::make($validated['password']),
            'manager_id' => $validated['manager_id'] ?? null,
            'division_id' => $validated['division_id'] ?? null,
        ]);

        $employee->assignRole($validated['roles']);

        if ($request->hasFile('avatar')) {
            $employee->addMediaFromRequest('avatar')->toMediaCollection('avatars');
        }

        return redirect()->route('employees.index')->with('success', 'Employee berhasil dibuat.');
    }

    public function edit(User $employee)
    {
        $roles = Role::where('name', '!=', 'admin')->get();
        $employee->load('roles');
        $potentialManagers = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['manager', 'leader']);
        })
        ->where('id', '!=', $employee->id)
        ->select('id', 'name')->get();
        $divisions = Division::all();

        return Inertia::render('employees/Form', [
            'employee' => $employee->only(['id', 'name', 'email', 'nik', 'personal_email', 'phone_number', 'address', 'manager_id', 'division_id']),
            'roles' => $roles,
            'currentRoles' => $employee->roles->pluck('name')->toArray(),
            'potentialManagers' => $potentialManagers,
            'divisions' => $divisions,
            'avatar_url' => $employee->getFirstMediaUrl('avatars'), // Pass existing avatar URL
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
            'manager_id' => ['nullable', 'exists:users,id', Rule::notIn([$employee->id])],
            'division_id' => ['nullable', 'exists:divisions,id'],
            'avatar' => ['nullable', 'image', 'max:2048'], // Add avatar validation
            'remove_avatar' => ['boolean'], // Flag to remove existing avatar
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
            'manager_id' => $validated['manager_id'] ?? null,
            'division_id' => $validated['division_id'] ?? null,
        ]);

        $employee->syncRoles($validated['roles']);

        if ($request->hasFile('avatar')) {
            $employee->clearMediaCollection('avatars'); // Remove old avatar
            $employee->addMediaFromRequest('avatar')->toMediaCollection('avatars');
        } elseif ($request->input('remove_avatar')) {
            $employee->clearMediaCollection('avatars');
        }

        return redirect()->route('employees.index')->with('success', 'Employee berhasil diperbarui.');
    }

    public function destroy(User $employee)
    {
        $employee->delete();
        return redirect()->route('employees.index')->with('success', 'Employee berhasil dihapus.');
    }

    public function export(Request $request, $format)
    {
        $employees = User::with(['roles', 'division'])
            ->whereHas('roles', function ($q) {
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

        try {
            $import = new EmployeesImport;
            Excel::import($import, $request->file('file'));

            if ($import->failures()->isNotEmpty()) {
                $errors = $import->failures()->map(function (Failure $failure) {
                    return 'Baris ' . $failure->row() . ': ' . implode(', ', $failure->errors());
                })->implode('<br>');

                return redirect()->back()->with('error', 'Impor selesai dengan beberapa kegagalan:<br>' . $errors);
            }

            return redirect()->back()->with('success', 'Karyawan berhasil diimpor.');

        } catch (ValidationException $e) {
            $failures = $e->failures();
            $errors = collect($failures)->map(function (Failure $failure) {
                return 'Baris ' . $failure->row() . ': ' . implode(', ', $failure->errors());
            })->implode('<br>');
            return redirect()->back()->with('error', 'Impor gagal karena kesalahan validasi:<br>' . $errors);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan tak terduga selama impor: ' . $e->getMessage());
        }
    }

    public function downloadImportTemplate()
    {
        return Excel::download(new EmployeeImportTemplateExport, 'employee_import_template.xlsx');
    }
}