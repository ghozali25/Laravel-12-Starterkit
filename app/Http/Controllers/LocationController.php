<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::with('parent');

        if ($request->filled('type') && in_array($request->type, ['company','branch','site'])) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        $locations = $query->orderBy('type')->orderBy('name')->paginate(10)->withQueryString();
        $parents = Location::orderBy('name')->get(['id','name','type']);

        return Inertia::render('locations/Index', [
            'locations' => $locations,
            'parents' => $parents,
            'filters' => $request->only(['type','search']),
        ]);
    }

    public function create()
    {
        $parents = Location::orderBy('name')->get(['id','name','type']);
        return Inertia::render('locations/Form', [
            'parents' => $parents,
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403);
        }
        $data = $request->validate([
            'parent_id' => 'nullable|exists:locations,id',
            'type' => 'required|in:company,branch,site',
            'code' => 'required|string|max:100|unique:locations,code',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);
        $data['is_active'] = $data['is_active'] ?? true;

        Location::create($data);
        return redirect()->route('locations.index')->with('success', 'Lokasi berhasil dibuat.');
    }

    public function edit(Location $location)
    {
        $parents = Location::where('id','!=',$location->id)->orderBy('name')->get(['id','name','type']);
        return Inertia::render('locations/Form', [
            'location' => $location,
            'parents' => $parents,
        ]);
    }

    public function update(Request $request, Location $location)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403);
        }
        $data = $request->validate([
            'parent_id' => 'nullable|exists:locations,id|not_in:' . $location->id,
            'type' => 'required|in:company,branch,site',
            'code' => 'required|string|max:100|unique:locations,code,' . $location->id,
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $location->update($data);
        return redirect()->route('locations.index')->with('success', 'Lokasi berhasil diperbarui.');
    }

    public function destroy(Location $location)
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(403);
        }
        if ($location->children()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus lokasi yang memiliki anak.');
        }
        $location->delete();
        return redirect()->route('locations.index')->with('success', 'Lokasi berhasil dihapus.');
    }
}
