<?php

namespace App\Http\Controllers;

use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoginActivityController extends Controller
{
    public function index(Request $request)
    {
        $q = LoginActivity::with('user');

        if ($request->filled('event') && in_array($request->event, ['login','logout','failed'])) {
            $q->where('event', $request->event);
        }
        if ($request->filled('user_id')) {
            $q->where('user_id', $request->user_id);
        }
        if ($s = trim((string) $request->get('search', ''))) {
            $q->where(function ($w) use ($s) {
                $w->where('ip_address', 'like', "%$s%")
                  ->orWhere('user_agent', 'like', "%$s%")
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%$s%"));
            });
        }

        $logs = $q->orderByDesc('created_at')->paginate(20)->withQueryString();
        $users = User::select('id','name')->orderBy('name')->get();

        return Inertia::render('login-activities/Index', [
            'logs' => $logs->through(fn($a) => [
                'id' => $a->id,
                'event' => $a->event,
                'ip_address' => $a->ip_address,
                'user_agent' => $a->user_agent,
                'session_id' => $a->session_id,
                'user' => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                'created_at' => $a->created_at->toDateTimeString(),
            ]),
            'users' => $users,
            'filters' => $request->only(['event','user_id','search'])
        ]);
    }
}
