<?php

namespace App\Http\Middleware;

use App\Models\SettingApp;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Lang; // Import Lang facade
use Illuminate\Support\Arr;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'is_admin' => fn () => $request->user()?->hasRole('admin') ?? false,
            ],
            'notifications' => function () use ($request) {
                $user = $request->user();
                if (!$user) return ['unread_count' => 0, 'items' => []];
                $unreadCount = $user->unreadNotifications()->count();
                $items = $user->notifications()->latest()->limit(10)->get()->map(function ($n) {
                    return [
                        'id' => $n->id,
                        'type' => class_basename($n->type),
                        'data' => $n->data,
                        'read_at' => $n->read_at,
                        'created_at' => $n->created_at?->toDateTimeString(),
                    ];
                });
                return ['unread_count' => $unreadCount, 'items' => $items];
            },
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'setting' => fn() => SettingApp::first() ? array_merge(SettingApp::first()->toArray(), [
                'registration_enabled' => SettingApp::first()->registration_enabled,
            ]) : ['registration_enabled' => true], // Provide a default if no settings exist
            'locale' => app()->getLocale(), // Share current locale
            // Share JSON translations (resources/lang/{locale}.json) with fallback to en.json
            'translations' => (function () {
                $locale = app()->getLocale() ?: 'en';
                $base = base_path('resources/lang');
                $enPath = $base . DIRECTORY_SEPARATOR . 'en.json';
                $locPath = $base . DIRECTORY_SEPARATOR . $locale . '.json';
                $en = file_exists($enPath) ? json_decode((string) file_get_contents($enPath), true) ?: [] : [];
                $loc = file_exists($locPath) ? json_decode((string) file_get_contents($locPath), true) ?: [] : [];
                // Locale-specific overrides English fallback
                return array_merge($en, $loc);
            })(),
        ]);
    }
}