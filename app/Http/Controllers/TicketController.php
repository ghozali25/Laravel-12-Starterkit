<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use App\Notifications\TicketCommentAdded;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['user', 'assignedUser', 'comments']);

        // Filter by user role
        if (Auth::user()->hasRole('admin') || Auth::user()->hasRole('it_support')) {
            // Admin and IT support can see all tickets
        } else {
            // Regular staff can only see their own tickets
            $query->where('user_id', Auth::id());
        }

        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('ticket_number', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $tickets = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('tickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['status', 'priority', 'category', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('tickets/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'category' => 'required|in:hardware,software,network,email,access,other',
            'damage_photos' => 'nullable|array|max:3',
            'damage_photos.*' => 'image|max:2048',
        ]);

        $photoPaths = [];
        if ($request->hasFile('damage_photos')) {
            foreach ($request->file('damage_photos') as $file) {
                $photoPaths[] = $file->store('ticket-photos', 'public');
            }
        }

        if (!empty($photoPaths)) {
            $validated['damage_photos'] = $photoPaths;
            // Keep first photo in damage_photo_path for backward compatibility
            $validated['damage_photo_path'] = $photoPaths[0];
        }

        $ticket = Ticket::create([
            ...$validated,
            'user_id' => Auth::id(),
            'status' => 'open',
        ]);

        return redirect()->route('tickets.show', $ticket)->with('success', 'Ticket berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Ticket $ticket)
    {
        // Check if user can view this ticket
        if (!Auth::user()->hasRole(['admin', 'it_support']) && $ticket->user_id !== Auth::id()) {
            abort(403, 'Anda tidak memiliki izin untuk melihat ticket ini.');
        }

        $ticket->load(['user', 'assignedUser', 'comments.user', 'histories']);

        return Inertia::render('tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ticket $ticket)
    {
        // Only admin and IT support can edit tickets
        if (!Auth::user()->hasRole(['admin', 'it_support'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit ticket.');
        }

        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'it_support']);
        })->get(['id', 'name']);

        return Inertia::render('tickets/Edit', [
            'ticket' => $ticket,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ticket $ticket)
    {
        // Only admin and IT support can update tickets
        if (!Auth::user()->hasRole(['admin', 'it_support'])) {
            abort(403, 'Anda tidak memiliki izin untuk mengupdate ticket.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'category' => 'required|in:hardware,software,network,email,access,other',
            'status' => 'required|in:open,in_progress,resolved,closed,cancelled',
            'assigned_to' => 'nullable|exists:users,id',
            'resolution' => 'nullable|string',
            'keep_damage_photos' => 'nullable|array',
            'keep_damage_photos.*' => 'string',
            'damage_photos' => 'nullable|array|max:3',
            'damage_photos.*' => 'image|max:2048',
        ]);

        // Set resolved_at if status is resolved
        if ($validated['status'] === 'resolved' && $ticket->status !== 'resolved') {
            $validated['resolved_at'] = now();
        }

        // Handle damage photos (merge kept existing + new uploads, max 3)
        $existingPhotos = $ticket->damage_photos ?? ($ticket->damage_photo_path ? [$ticket->damage_photo_path] : []);

        $keepPhotos = $request->input('keep_damage_photos', $existingPhotos);
        if (!is_array($keepPhotos)) {
            $keepPhotos = [];
        }

        // Only keep photos that actually belong to this ticket
        $kept = array_values(array_intersect($existingPhotos, $keepPhotos));

        $photoPaths = $kept;

        if ($request->hasFile('damage_photos')) {
            foreach ($request->file('damage_photos') as $file) {
                if (count($photoPaths) >= 3) {
                    break;
                }
                $photoPaths[] = $file->store('ticket-photos', 'public');
            }
        }

        if (!empty($photoPaths)) {
            $validated['damage_photos'] = $photoPaths;
            $validated['damage_photo_path'] = $photoPaths[0];
        } else {
            $validated['damage_photos'] = null;
            $validated['damage_photo_path'] = null;
        }

        unset($validated['keep_damage_photos']);

        $ticket->update($validated);

        return redirect()->route('tickets.show', $ticket)->with('success', 'Ticket berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ticket $ticket)
    {
        // Only admin can delete tickets
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki izin untuk menghapus ticket.');
        }

        $ticket->delete();

        return redirect()->route('tickets.index')->with('success', 'Ticket berhasil dihapus.');
    }

    /**
     * Add comment to ticket.
     */
    public function addComment(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'comment' => 'required|string',
            'is_internal' => 'boolean',
        ]);

        $comment = $ticket->comments()->create([
            'user_id' => Auth::id(),
            'comment' => $validated['comment'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);

        // Notify all users about the new comment
        $comment->load('user');
        $users = User::all();
        foreach ($users as $user) {
            $user->notify(new TicketCommentAdded($ticket, $comment));
        }

        return redirect()->back()->with('success', 'Komentar berhasil ditambahkan dan notifikasi telah dikirim.');
    }

    /**
     * Assign ticket to user.
     */
    public function assign(Request $request, Ticket $ticket)
    {
        // Only admin and IT support can assign tickets
        if (!Auth::user()->hasRole(['admin', 'it_support'])) {
            abort(403, 'Anda tidak memiliki izin untuk assign ticket.');
        }

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $ticket->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => 'in_progress',
        ]);

        return redirect()->back()->with('success', 'Ticket berhasil di-assign.');
    }
}
