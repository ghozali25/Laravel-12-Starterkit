<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\User;
use App\Models\Brand; // Import Brand model
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AssetsExport;
use App\Exports\AssetImportTemplateExport;
use App\Imports\AssetsImport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Validators\ValidationException;
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\Auth;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with(['category', 'user', 'currentLocation', 'vendor']);

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

        if ($request->filled('location_id')) {
            $query->where('current_location_id', $request->location_id);
        }

        $assets = $query->latest()->paginate(10)->withQueryString();

        $categories = AssetCategory::select('id', 'name')->get();
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin');
        })->select('id', 'name')->get();
        $locations = \App\Models\Location::select('id','name','type')->orderBy('type')->orderBy('name')->get();
        $vendors = Vendor::select('id','name')->get();

        return Inertia::render('assets/Index', [
            'assets' => $assets->through(fn ($asset) => [
                'id' => $asset->id,
                'serial_number' => $asset->serial_number,
                'brand' => $asset->brand,
                'model' => $asset->model,
                'category' => $asset->category ? ['id' => $asset->category->id, 'name' => $asset->category->name] : null,
                'user' => $asset->user ? ['id' => $asset->user->id, 'name' => $asset->user->name] : null,
                'current_location' => $asset->currentLocation ? ['id' => $asset->currentLocation->id, 'name' => $asset->currentLocation->name, 'type' => $asset->currentLocation->type] : null,
                'vendor' => $asset->vendor ? ['id' => $asset->vendor->id, 'name' => $asset->vendor->name] : null,
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
            'locations' => $locations,
            'vendors' => $vendors,
            'filters' => $request->only('search', 'category_id', 'user_id', 'location_id'),
        ]);
    }

    public function create()
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk membuat aset.');
        }
        $categories = AssetCategory::with('brands')->get(); // Eager load brands
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin');
        })->select('id', 'name')->get();
        $brands = Brand::all(); // Fetch all brands (for initial state or if no category selected)
        $locations = \App\Models\Location::select('id','name','type')->orderBy('type')->orderBy('name')->get();
        $vendors = Vendor::select('id','name')->get();

        return Inertia::render('assets/Form', [
            'categories' => $categories,
            'employees' => $employees,
            'brands' => $brands, // Pass all brands to the frontend
            'locations' => $locations,
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk membuat aset.');
        }
        $validated = $request->validate([
            'asset_category_id' => 'required|exists:asset_categories,id',
            'user_id' => 'nullable|exists:users,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'current_location_id' => 'nullable|exists:locations,id',
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
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit aset.');
        }
        $asset->load('category', 'user', 'vendor');
        $categories = AssetCategory::with('brands')->get(); // Eager load brands
        $employees = User::whereHas('roles', function ($q) {
            $q->where('name', '!=', 'admin');
        })->select('id', 'name')->get();
        $brands = Brand::all(); // Fetch all brands
        $locations = \App\Models\Location::select('id','name','type')->orderBy('type')->orderBy('name')->get();
        $vendors = Vendor::select('id','name')->get();

        return Inertia::render('assets/Form', [
            'asset' => $asset->toArray(),
            'categories' => $categories,
            'employees' => $employees,
            'brands' => $brands, // Pass all brands to the frontend
            'locations' => $locations,
            'vendors' => $vendors,
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk memperbarui aset.');
        }
        $validated = $request->validate([
            'asset_category_id' => 'required|exists:asset_categories,id',
            'user_id' => 'nullable|exists:users,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'current_location_id' => 'nullable|exists:locations,id',
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
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus aset.');
        }
        $asset->delete();
        return redirect()->route('assets.index')->with('success', 'Aset berhasil dihapus.');
    }

    public function export(Request $request, $format)
    {
        if (!Auth::user()->hasRole(['admin', 'it_support'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengekspor data aset.');
        }
        $assets = Asset::with(['category', 'user'])->get();

        if ($format === 'xlsx') {
            return Excel::download(new AssetsExport($assets), 'assets.xlsx');
        } elseif ($format === 'csv') {
            return Excel::download(new AssetsExport($assets), 'assets.csv', \Maatwebsite\Excel\Excel::CSV);
        } elseif ($format === 'pdf') {
            $pdf = Pdf::loadView('exports.assets_pdf', ['assets' => $assets]);
            return $pdf->download('assets.pdf');
        }

        return redirect()->back()->with('error', 'Format ekspor tidak valid.');
    }

    public function import(Request $request)
    {
        if (!Auth::user()->hasRole(['admin', 'it_support'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengimpor data aset.');
        }
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $import = new AssetsImport;
            Excel::import($import, $request->file('file'));

            if ($import->failures()->isNotEmpty()) {
                $errors = $import->failures()->map(function (Failure $failure) {
                    return 'Baris ' . $failure->row() . ': ' . implode(', ', $failure->errors());
                })->implode('<br>');

                return redirect()->back()->with('error', 'Impor selesai dengan beberapa kegagalan:<br>' . $errors);
            }

            return redirect()->back()->with('success', 'Aset berhasil diimpor.');

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
        return Excel::download(new AssetImportTemplateExport, 'asset_import_template.xlsx');
    }
}