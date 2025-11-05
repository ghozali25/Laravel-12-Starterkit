<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::query();
        if ($request->filled('search')) {
            $q = $request->get('search');
            $query->where(function($sub) use ($q){
                $sub->where('name','like',"%$q%")
                    ->orWhere('contact_name','like',"%$q%")
                    ->orWhere('email','like',"%$q%")
                    ->orWhere('phone','like',"%$q%");
            });
        }
        $vendors = $query->latest()->paginate(10)->withQueryString();
        return Inertia::render('vendors/Index', [
            'vendors' => $vendors,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('vendors/Form');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        Vendor::create($data);
        return redirect()->route('vendors.index')->with('success','Vendor created');
    }

    public function edit(Vendor $vendor)
    {
        return Inertia::render('vendors/Form', [ 'vendor' => $vendor ]);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $vendor->update($data);
        return redirect()->route('vendors.index')->with('success','Vendor updated');
    }

    public function destroy(Vendor $vendor)
    {
        // Optional: prevent delete if has assets
        if ($vendor->assets()->count() > 0) {
            return back()->with('error','Cannot delete vendor with linked assets');
        }
        $vendor->delete();
        return redirect()->route('vendors.index')->with('success','Vendor deleted');
    }
}
