<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
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
        return Inertia::render('asset-categories/Form');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:asset_categories,name',
            'description' => 'nullable|string',
            'custom_fields_schema' => 'nullable|json',
        ]);

        AssetCategory::create($request->all());

        return redirect()->route('asset-categories.index')->with('success', 'Kategori aset berhasil dibuat.');
    }

    public function edit(AssetCategory $assetCategory)
    {
        return Inertia::render('asset-categories/Form', [
            'category' => $assetCategory,
        ]);
    }

    public function update(Request $request, AssetCategory $assetCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:asset_categories,name,' . $assetCategory->id,
            'description' => 'nullable|string',
            'custom_fields_schema' => 'nullable|json',
        ]);

        $assetCategory->update($request->all());

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