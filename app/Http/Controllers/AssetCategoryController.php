<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use App\Models\Brand; // Import Brand model
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetCategory::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $categories = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('asset-categories/Index', [
            'categories' => $categories,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $allBrands = Brand::all(); // Get all brands
        return Inertia::render('asset-categories/Form', [
            'allBrands' => $allBrands,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:asset_categories,name',
            'description' => 'nullable|string',
            'custom_fields_schema' => 'nullable|json',
            'brands' => 'nullable|array', // Validate brands array
            'brands.*' => 'exists:brands,id', // Validate each brand ID
        ]);

        $category = AssetCategory::create($request->only(['name', 'description', 'custom_fields_schema']));
        $category->brands()->sync($request->input('brands', [])); // Sync brands

        return redirect()->route('asset-categories.index')->with('success', 'Kategori aset berhasil dibuat.');
    }

    public function edit(AssetCategory $assetCategory)
    {
        $assetCategory->load('brands'); // Eager load associated brands
        $allBrands = Brand::all(); // Get all brands

        return Inertia::render('asset-categories/Form', [
            'category' => $assetCategory,
            'allBrands' => $allBrands,
            'selectedBrands' => $assetCategory->brands->pluck('id')->toArray(), // Pass selected brand IDs
        ]);
    }

    public function update(Request $request, AssetCategory $assetCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:asset_categories,name,' . $assetCategory->id,
            'description' => 'nullable|string',
            'custom_fields_schema' => 'nullable|json',
            'brands' => 'nullable|array',
            'brands.*' => 'exists:brands,id',
        ]);

        $assetCategory->update($request->only(['name', 'description', 'custom_fields_schema']));
        $assetCategory->brands()->sync($request->input('brands', [])); // Sync brands

        return redirect()->route('asset-categories.index')->with('success', 'Kategori aset berhasil diperbarui.');
    }

    public function destroy(AssetCategory $assetCategory)
    {
        // TODO: Add logic to prevent deletion if assets are linked
        if ($assetCategory->assets()->count() > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus kategori karena masih ada aset yang terhubung.');
        }

        $assetCategory->delete();

        return redirect()->route('asset-categories.index')->with('success', 'Kategori aset berhasil dihapus.');
    }
}