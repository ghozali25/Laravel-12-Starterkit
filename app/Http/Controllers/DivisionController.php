<?php

namespace App\Http\Controllers;

use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    public function index(Request $request)
    {
        $query = Division::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $divisions = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('divisions/Index', [
            'divisions' => $divisions,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('divisions/Form');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:divisions,name',
        ]);

        Division::create($request->all());

        return redirect()->route('divisions.index')->with('success', 'Divisi berhasil dibuat.');
    }

    public function edit(Division $division)
    {
        return Inertia::render('divisions/Form', [
            'division' => $division,
        ]);
    }

    public function update(Request $request, Division $division)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:divisions,name,' . $division->id,
        ]);

        $division->update($request->all());

        return redirect()->route('divisions.index')->with('success', 'Divisi berhasil diperbarui.');
    }

    public function destroy(Division $division)
    {
        // Pastikan tidak ada user yang terhubung dengan divisi ini sebelum menghapus
        if ($division->users()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus divisi karena masih ada karyawan yang terhubung.');
        }

        $division->delete();

        return redirect()->route('divisions.index')->with('success', 'Divisi berhasil dihapus.');
    }
}