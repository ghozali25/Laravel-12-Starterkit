<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with(['category', 'user']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('serial_number', 'like', '%' . $request->search . '%')
                    ->orWhere('brand', 'like', '%' . $request->search . '%')
                    ->orWhere('model', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($sq) use ($request) {
                        $sq->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('category', function ($sq) use ($request) {
                        $sq->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->filled('category_id')) {
            $query->where('asset_category_id', $request->category_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $assets = $query->latest()->paginate(10)->withQueryString();

        $categories = AssetCategory::select('id', 'name')->get();
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin');
        })->select('id', 'name')->get();

        return Inertia::render('assets/Index', [
            'assets' => $assets->through(fn ($asset) => [
                'id' => $asset->id,
                'serial_number' => $asset->serial_number,
                'brand' => $asset->brand,
                'model' => $asset->model,
                'category' => $asset->category ? ['id' => $asset->category->id, 'name' => $asset->category->name] : null,
                'user' => $asset->user ? ['id' => $asset->user->id, 'name' => $asset->user->name] : null,
                'purchase_date' => $asset->purchase_date ? $asset->purchase_date->format('Y-m-d') : null,
                'warranty_end_date' => $asset->warranty_end_date ? $asset->warranty_end_date->format('Y-m-d') : null,
                'status' => $asset->status,
                'notes' => $asset->notes,
                'custom_fields_data' => $asset->custom_fields_data,
                'last_used_at' => $asset->last_used_at ? $asset->last_used_at->diffForHumans() : null,
                'created_at' => $asset->created_at->diffForHumans(),
            ]),
            'categories' => $categories,
            'employees' => $employees,
            'filters' => $request->only('search', 'category_id', 'user_id'),
        ]);
    }

    public function create()
    {
        $categories = AssetCategory::all();
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin');
        })->select('id', 'name')->get();

        return Inertia::render('assets/Form', [
            'categories' => $categories,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_category_id' => 'required|exists:asset_categories,id',
            'user_id' => 'nullable|exists:users,id',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'warranty_end_date' => 'nullable|date|after_or_equal:purchase_date',
            'status' => 'required|string|in:available,assigned,in_repair,retired',
            'notes' => 'nullable|string',
            'custom_fields_data' => 'nullable|array',
        ]);

        // Set last_used_at if assigned to a user
        if ($validated['user_id']) {
            $validated['last_used_at'] = Carbon::now();
        }

        Asset::create($validated);

        return redirect()->route('assets.index')->with('success', 'Aset berhasil dibuat.');
    }

    public function edit(Asset $asset)
    {
        $asset->load('category', 'user');
        $categories = AssetCategory::all();
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin');
        })->select('id', 'name')->get();

        return Inertia::render('assets/Form', [
            'asset' => $asset->toArray(),
            'categories' => $categories,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'asset_category_id' => 'required|exists:asset_categories,id',
            'user_id' => 'nullable|exists:users,id',
            'serial_number' => 'nullable|string|max:255|unique:assets,serial_number,' . $asset->id,
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'warranty_end_date' => 'nullable|date|after_or_equal:purchase_date',
            'status' => 'required|string|in:available,assigned,in_repair,retired',
            'notes' => 'nullable|string',
            'custom_fields_data' => 'nullable|array',
        ]);

        // Update last_used_at logic
        if ($validated['user_id'] && $asset->user_id !== $validated['user_id']) {
            // If assigned to a new user
            $validated['last_used_at'] = Carbon::now();
        } elseif (!$validated['user_id'] && $asset->user_id) {
            // If unassigned
            $validated['last_used_at'] = null;
        }

        $asset->update($validated);

        return redirect()->route('assets.index')->with('success', 'Aset berhasil diperbarui.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->route('assets.index')->with('success', 'Aset berhasil dihapus.');
    }
}