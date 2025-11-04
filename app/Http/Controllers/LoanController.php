<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Loan;
use App\Models\LoanItem;
use App\Models\User;
use App\Notifications\LoanCreated;
use App\Notifications\LoanItemReturned;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = Loan::with(['borrower', 'loanedBy', 'items.asset']);

        if ($request->filled('status') && in_array($request->status, ['ongoing','returned','overdue','cancelled'])) {
            $query->where('status', $request->status);
        }
        if ($request->filled('borrower_user_id')) {
            $query->where('borrower_user_id', $request->borrower_user_id);
        }

        $loans = $query->latest()->paginate(10)->withQueryString();
        $employees = User::select('id','name')->get();

        return Inertia::render('loans/Index', [
            'loans' => $loans->through(function($loan){
                return [
                    'id' => $loan->id,
                    'borrower' => $loan->borrower?->only(['id','name']),
                    'loaned_by' => $loan->loanedBy?->only(['id','name']),
                    'status' => $loan->status,
                    'due_at' => optional($loan->due_at)?->toDateTimeString(),
                    'returned_at' => optional($loan->returned_at)?->toDateTimeString(),
                    'items_count' => $loan->items->count(),
                    'created_at' => $loan->created_at->toDateTimeString(),
                ];
            }),
            'employees' => $employees,
            'filters' => $request->only(['status','borrower_user_id'])
        ]);
    }

    public function create()
    {
        $employees = User::select('id','name')->get();

        // Available assets: not in any open loan item (returned_at is null on item and loan.status in ongoing)
        $busyAssetIds = LoanItem::whereNull('returned_at')->pluck('asset_id');
        $assets = Asset::whereNotIn('id', $busyAssetIds)->select('id','serial_number','brand','model')->get();

        return Inertia::render('loans/Form', [
            'employees' => $employees,
            'assets' => $assets,
            'defaults' => [
                'loaned_by_user_id' => Auth::id(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'borrower_user_id' => 'required|exists:users,id',
            'loaned_by_user_id' => 'required|exists:users,id',
            'due_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'asset_ids' => 'required|array|min:1',
            'asset_ids.*' => 'required|exists:assets,id',
        ]);

        // Enforce: assets cannot be loaned if currently out
        $conflicts = LoanItem::whereNull('returned_at')
            ->whereIn('asset_id', $validated['asset_ids'])
            ->pluck('asset_id')
            ->unique();
        if ($conflicts->isNotEmpty()) {
            return back()->with('error', 'Beberapa aset sedang dipinjam: ID '.implode(',', $conflicts->toArray()))->withInput();
        }

        DB::transaction(function () use ($validated) {
            $loan = Loan::create([
                'borrower_user_id' => $validated['borrower_user_id'],
                'loaned_by_user_id' => $validated['loaned_by_user_id'],
                'due_at' => $validated['due_at'] ?? null,
                'status' => 'ongoing',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['asset_ids'] as $assetId) {
                LoanItem::create([
                    'loan_id' => $loan->id,
                    'asset_id' => $assetId,
                    'condition_out' => null,
                ]);
            }

            // Notify borrower and staff via email (if mail configured)
            $loan->load(['borrower','loanedBy','items.asset']);
            if ($loan->borrower) {
                $loan->borrower->notify(new LoanCreated($loan));
            }
            if ($loan->loanedBy && $loan->loaned_by_user_id !== $loan->borrower_user_id) {
                $loan->loanedBy->notify(new LoanCreated($loan));
            }
        });

        return redirect()->route('loans.index')->with('success', 'Peminjaman berhasil dibuat.');
    }

    public function returnItem(Request $request, LoanItem $item)
    {
        if ($item->returned_at) {
            return back()->with('error', 'Item sudah dikembalikan.');
        }
        $item->update([
            'condition_in' => $request->input('condition_in'),
            'returned_at' => now(),
        ]);

        // If all items returned, mark loan returned
        $loan = $item->loan()->with('items')->first();
        $allReturned = $loan->items()->whereNull('returned_at')->count() === 0;
        if ($allReturned) {
            $loan->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);
        }

        // Notify borrower and staff about item return
        $item->load(['loan.borrower','loan.loanedBy','asset']);
        if ($item->loan?->borrower) {
            $item->loan->borrower->notify(new LoanItemReturned($item));
        }
        if ($item->loan?->loanedBy && $item->loan->loaned_by_user_id !== $item->loan->borrower_user_id) {
            $item->loan->loanedBy->notify(new LoanItemReturned($item));
        }

        return back()->with('success', 'Item berhasil dikembalikan.');
    }

    public function show(Loan $loan)
    {
        $loan->load(['borrower','loanedBy','items.asset']);

        return Inertia::render('loans/Show', [
            'loan' => [
                'id' => $loan->id,
                'borrower' => $loan->borrower?->only(['id','name']),
                'loaned_by' => $loan->loanedBy?->only(['id','name']),
                'status' => $loan->status,
                'due_at' => optional($loan->due_at)?->toDateTimeString(),
                'returned_at' => optional($loan->returned_at)?->toDateTimeString(),
                'notes' => $loan->notes,
                'created_at' => $loan->created_at->toDateTimeString(),
            ],
            'items' => $loan->items->map(fn($it) => [
                'id' => $it->id,
                'asset' => $it->asset ? [
                    'id' => $it->asset->id,
                    'serial_number' => $it->asset->serial_number,
                    'brand' => $it->asset->brand,
                    'model' => $it->asset->model,
                ] : null,
                'condition_out' => $it->condition_out,
                'condition_in' => $it->condition_in,
                'returned_at' => optional($it->returned_at)?->toDateTimeString(),
            ]),
        ]);
    }
}
