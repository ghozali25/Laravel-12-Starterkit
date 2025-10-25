<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class NotificationController extends Controller
{
    public function readAll(Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($user) {
            $user->unreadNotifications()->update(['read_at' => now()]);
        }
        return back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
    }

    public function read(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();
        if ($user) {
            $notification = $user->notifications()->where('id', $id)->first();
            if ($notification && is_null($notification->read_at)) {
                $notification->update(['read_at' => now()]);
            }
        }
        return back();
    }
}
