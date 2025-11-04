<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Location;
use Illuminate\Http\Request;

class LookupController extends Controller
{
    public function employees(Request $request)
    {
        $q = User::query()->select('id','name');
        // optional role filter (e.g., manager, leader)
        if ($request->filled('only_managers')) {
            $q->whereHas('roles', function($r){
                $r->whereIn('name', ['manager','leader']);
            });
        } else {
            // exclude admin by default
            $q->whereHas('roles', function($r){
                $r->where('name', '!=', 'admin');
            });
        }
        if ($s = trim((string) $request->get('search', ''))) {
            $q->where('name', 'like', "%$s%");
        }
        return response()->json([
            'data' => $q->orderBy('name')->limit(50)->get(),
        ]);
    }

    public function locations(Request $request)
    {
        $q = Location::query()->select('id','name','type');
        if ($s = trim((string) $request->get('search', ''))) {
            $q->where(function($w) use ($s){
                $w->where('name', 'like', "%$s%")
                  ->orWhere('code', 'like', "%$s%")
                  ->orWhere('type', 'like', "%$s%");
            });
        }
        return response()->json([
            'data' => $q->orderBy('type')->orderBy('name')->limit(50)->get(),
        ]);
    }
}
