<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AssetMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetMovement::with(['asset', 'fromLocation', 'toLocation', 'fromUser', 'toUser', 'requester', 'approver']);

        if ($request->filled('status') && in_array($request->status, ['pending','approved','rejected'])) {
            $query->where('status', $request->status);
        }
        if ($request->filled('asset_id')) {
            $query->where('asset_id', $request->asset_id);
        }

        $movements = $query->latest()->paginate(10)->withQueryString();
        $assets = Asset::select('id','serial_number','brand','model')->get();

        return Inertia::render('asset-movements/Index', [
            'movements' => $movements->through(fn($m) => [
                'id' => $m->id,
                'asset' => $m->asset ? [
                    'id' => $m->asset->id,
                    'label' => trim(($m->asset->serial_number ?: '').' '.$m->asset->brand.' '.$m->asset->model)
                ] : null,
                'from_location' => $m->fromLocation ? ['id' => $m->fromLocation->id, 'name' => $m->fromLocation->name, 'type' => $m->fromLocation->type] : null,
                'to_location' => $m->toLocation ? ['id' => $m->toLocation->id, 'name' => $m->toLocation->name, 'type' => $m->toLocation->type] : null,
                'from_user' => $m->fromUser ? ['id' => $m->fromUser->id, 'name' => $m->fromUser->name] : null,
                'to_user' => $m->toUser ? ['id' => $m->toUser->id, 'name' => $m->toUser->name] : null,
                'reason' => $m->reason,
                'status' => $m->status,
                'requested_by' => $m->requester?->name,
                'approved_by' => $m->approver?->name,
                'approved_at' => $m->approved_at?->toDateTimeString(),
                'created_at' => $m->created_at->toDateTimeString(),
            ]),
            'assets' => $assets,
            'filters' => $request->only(['status','asset_id']),
        ]);
    }

    public function create()
    {
        $assets = Asset::select('id','serial_number','brand','model','user_id','current_location_id')->get();
        $users = User::select('id','name')->get();
        $locations = Location::select('id','name','type')->orderBy('type')->orderBy('name')->get();

        return Inertia::render('asset-movements/Form', [
            'assets' => $assets,
            'users' => $users,
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'from_location_id' => 'nullable|exists:locations,id',
            'to_location_id' => 'nullable|exists:locations,id',
            'from_user_id' => 'nullable|exists:users,id',
            'to_user_id' => 'nullable|exists:users,id',
            'reason' => 'nullable|string',
        ]);

        $validated['requested_by'] = Auth::id();

        AssetMovement::create($validated);

        return redirect()->route('asset-movements.index')->with('success', 'Permohonan perpindahan aset dibuat.');
    }

    public function approve(Request $request, AssetMovement $movement)
    {
        if (!Auth::user()->hasRole(['admin','it_support'])) {
            abort(403);
        }
        if ($movement->status !== 'pending') {
            return back()->with('error', 'Pergerakan aset sudah diproses.');
        }

        DB::transaction(function() use ($movement) {
            $movement->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            // Update asset current location and assigned user if provided
            $asset = $movement->asset;
            if ($movement->to_location_id) {
                $asset->current_location_id = $movement->to_location_id;
            }
            if ($movement->to_user_id !== null) {
                $asset->user_id = $movement->to_user_id;
            }
            $asset->save();
        });

        return back()->with('success', 'Perpindahan aset disetujui.');
    }

    public function reject(Request $request, AssetMovement $movement)
    {
        if (!Auth::user()->hasRole(['admin','it_support'])) {
            abort(403);
        }
        if ($movement->status !== 'pending') {
            return back()->with('error', 'Pergerakan aset sudah diproses.');
        }

        $movement->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Perpindahan aset ditolak.');
    }
}
