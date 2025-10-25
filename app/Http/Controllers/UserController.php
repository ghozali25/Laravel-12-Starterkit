<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('users/Index', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk membuat user.');
        }
        $roles = Role::all();

        return Inertia::render('users/Form', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk membuat user.');
        }
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'roles'    => ['required', 'array', 'min:1'],
            'roles.*'  => ['required', Rule::exists('roles', 'name')],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['roles']);

        return redirect()->route('users.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit user.');
        }
        $roles = Role::all();

        return Inertia::render('users/Form', [
            'user'         => $user->only(['id', 'name', 'email']),
            'roles'        => $roles,
            'currentRoles' => $user->roles->pluck('name')->toArray(), // multiple roles
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk memperbarui user.');
        }
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'roles'    => ['required', 'array', 'min:1'],
            'roles.*'  => ['required', Rule::exists('roles', 'name')],
        ]);

        $user->update([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password']
                ? Hash::make($validated['password'])
                : $user->password,
        ]);

        $user->syncRoles($validated['roles']);

        return redirect()->route('users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus user.');
        }
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus.');
    }

    public function resetPassword(User $user)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk mereset password user.');
        }
        // Generate a strong temporary password and show it once to admin
        $temporaryPassword = base64_encode(random_bytes(9)); // ~12 chars
        $user->update([
            'password' => Hash::make($temporaryPassword),
        ]);

        return redirect()->back()->with('success', 'Password berhasil direset. Password sementara: ' . $temporaryPassword);
    }
}