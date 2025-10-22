<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $brands = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('brands/Index', [
            'brands' => $brands,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('brands/Form');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
        ]);

        Brand::create($request->all());

        return redirect()->route('brands.index')->with('success', 'Brand berhasil dibuat.');
    }

    public function edit(Brand $brand)
    {
        return Inertia::render('brands/Form', [
            'brand' => $brand,
        ]);
    }

    public function update(Request $request, Brand $brand)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:brands,name,' . $brand->id,
        ]);

        $brand->update($request->all());

        return redirect()->route('brands.index')->with('success', 'Brand berhasil diperbarui.');
    }

    public function destroy(Brand $brand)
    {
        // TODO: Add logic to prevent deletion if assets are linked to this brand via categories
        // For now, we'll allow deletion, but in a real app, you'd check for dependencies.
        
        $brand->delete();

        return redirect()->route('brands.index')->with('success', 'Brand berhasil dihapus.');
    }
}