<?php

namespace App\Providers;

use App\Models\Menu;
use App\Models\User;
use App\Models\SettingApp;
use App\Models\DashboardWidget;
use App\Models\Division;
use App\Models\AssetCategory;
use App\Models\Asset;
use App\Models\Brand; // Import the new Brand model
use App\Models\Location;
use Spatie\Permission\Models\Role;
use App\Observers\GlobalActivityLogger;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login as AuthLogin;
use Illuminate\Auth\Events\Logout as AuthLogout;
use Illuminate\Auth\Events\Failed as AuthFailed;
use App\Models\LoginActivity;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ✅ Tambahkan ini untuk mengatasi "Specified key was too long"
        Schema::defaultStringLength(191);
        User::observe(GlobalActivityLogger::class);
        Role::observe(GlobalActivityLogger::class);
    
        Permission::observe(GlobalActivityLogger::class);
        Menu::observe(GlobalActivityLogger::class);
        SettingApp::observe(GlobalActivityLogger::class);
        DashboardWidget::observe(GlobalActivityLogger::class);
        Division::observe(GlobalActivityLogger::class);
        AssetCategory::observe(GlobalActivityLogger::class);
        Asset::observe(GlobalActivityLogger::class);
        Brand::observe(GlobalActivityLogger::class); // Add Brand observer
        Location::observe(GlobalActivityLogger::class);

        // Login/Logout/Failed event listeners to track login history
        Event::listen(AuthLogin::class, function (AuthLogin $event) {
            LoginActivity::create([
                'user_id' => $event->user->id,
                'event' => 'login',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'session_id' => session()->getId(),
            ]);
        });

        Event::listen(AuthLogout::class, function (AuthLogout $event) {
            LoginActivity::create([
                'user_id' => $event->user?->id,
                'event' => 'logout',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'session_id' => session()->getId(),
            ]);
        });

        Event::listen(AuthFailed::class, function (AuthFailed $event) {
            LoginActivity::create([
                'user_id' => optional($event->user)->id,
                'event' => 'failed',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'session_id' => session()->getId(),
            ]);
        });
    }
}