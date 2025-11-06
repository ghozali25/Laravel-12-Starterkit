<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\Asset;
use App\Models\Vendor;

class UtilitiesTrashController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->integer('limit', 50);
        $payload = [
            'users' => User::onlyTrashed()->select('id','name','email','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'tickets' => Ticket::onlyTrashed()->select('id','ticket_number','title','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'ticket_comments' => TicketComment::onlyTrashed()->select('id','ticket_id','user_id','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'assets' => Asset::onlyTrashed()->select('id','serial_number','brand','model','deleted_at')->latest('deleted_at')->limit($limit)->get(),
            'vendors' => Vendor::onlyTrashed()->select('id','name','deleted_at')->latest('deleted_at')->limit($limit)->get(),
        ];

        return Inertia::render('utilities/Trash', [
            'trash' => $payload,
            'limit' => $limit,
        ]);
    }

    public function bulkRestore(Request $request)
    {
        $data = $request->validate([
            'model' => 'required|string|in:users,tickets,ticket_comments,assets,vendors',
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);
        $class = $this->resolveModel($data['model']);
        if (!$class) return back()->with('error', 'Model tidak dikenali.');
        $class::withTrashed()->whereIn('id', $data['ids'])->restore();
        return back()->with('success', 'Data berhasil direstore.');
    }

    public function bulkForceDelete(Request $request)
    {
        $data = $request->validate([
            'model' => 'required|string|in:users,tickets,ticket_comments,assets,vendors',
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);
        $class = $this->resolveModel($data['model']);
        if (!$class) return back()->with('error', 'Model tidak dikenali.');
        $class::withTrashed()->whereIn('id', $data['ids'])->forceDelete();
        return back()->with('success', 'Data dihapus permanen.');
    }

    protected function resolveModel(string $key): ?string
    {
        return [
            'users' => User::class,
            'tickets' => Ticket::class,
            'ticket_comments' => TicketComment::class,
            'assets' => Asset::class,
            'vendors' => Vendor::class,
        ][$key] ?? null;
    }
}
