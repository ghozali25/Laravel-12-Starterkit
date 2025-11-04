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
    }
}