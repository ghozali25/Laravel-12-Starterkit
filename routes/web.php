<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\UserFileController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\MediaFolderController;
use App\Http\Controllers\UtilitiesTrashController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\BrandController; // Import BrandController
use App\Http\Controllers\TicketController; // Import TicketController
use App\Http\Controllers\LocationController; // Import LocationController
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AssetMovementController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\LoginActivityController;
use App\Http\Controllers\LookupController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Interactive ERD viewer route using React (admin / it_support only)
Route::get('/erd', function () {
    $database = DB::connection()->getDatabaseName();

    $tables = collect(DB::select(
        'SELECT TABLE_NAME AS table_name
         FROM information_schema.tables
         WHERE table_schema = ?
         ORDER BY TABLE_NAME',
        [$database]
    ))->pluck('table_name')->values();

    $rawColumns = collect(DB::select(
        'SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name, DATA_TYPE AS data_type, COLUMN_KEY
         FROM information_schema.columns
         WHERE table_schema = ?
         ORDER BY TABLE_NAME, ORDINAL_POSITION',
        [$database]
    ));

    $rawRelations = collect(DB::select(
        'SELECT
            TABLE_NAME AS table_name,
            COLUMN_NAME AS column_name,
            REFERENCED_TABLE_NAME AS referenced_table,
            REFERENCED_COLUMN_NAME AS referenced_column
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL
         ORDER BY TABLE_NAME, COLUMN_NAME',
        [$database]
    ));

    // Build FK lookup so we can mark FK columns
    $fkLookup = $rawRelations->groupBy(function ($fk) {
        return $fk->table_name . ':' . $fk->column_name;
    });

    $columns = $rawColumns->map(function ($col) use ($fkLookup) {
        $key = $col->table_name . ':' . $col->column_name;
        $fk = $fkLookup->get($key)?->first();

        return [
            'table' => $col->table_name,
            'name' => $col->column_name,
            'type' => $col->data_type,
            'is_primary' => $col->COLUMN_KEY === 'PRI',
            'is_foreign' => $fk !== null,
            'references_table' => $fk->referenced_table ?? null,
            'references_column' => $fk->referenced_column ?? null,
        ];
    })->values();

    $relations = $rawRelations->map(function ($fk) {
        return [
            'table' => $fk->table_name,
            'column' => $fk->column_name,
            'referenced_table' => $fk->referenced_table,
            'referenced_column' => $fk->referenced_column,
            'cardinality_from' => 'n', // many side (child)
            'cardinality_to' => '1',   // one side (parent)
        ];
    })->values();

    $schema = [
        'tables' => $tables,
        'columns' => $columns,
        'relations' => $relations,
    ];

    return Inertia::render('erd/ErdPage', [
        'schema' => $schema,
    ]);
})->middleware(['auth', 'role:admin|it_support']);

// Language switching route
Route::get('/lang/{locale}', [LanguageController::class, 'setLocale'])->name('language.set');

Route::middleware(['auth', 'menu.permission'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('dashboard/save-widgets', [DashboardController::class, 'saveWidgets'])->name('dashboard.save-widgets');

    Route::resource('roles', RoleController::class);
    Route::resource('menus', MenuController::class);
    Route::post('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
    Route::patch('menus/{menu}/enable', [MenuController::class, 'enable'])->name('menus.enable');
    Route::patch('menus/{menu}/disable', [MenuController::class, 'disable'])->name('menus.disable');
    Route::patch('menus/{menu}/toggle', [MenuController::class, 'toggle'])->name('menus.toggle');
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
    Route::put('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('/users/{user}/send-reset-link', [UserController::class, 'sendResetLink'])->name('users.send-reset-link');
    Route::post('/users/bulk-avatar', [UserController::class, 'bulkAvatar'])->name('users.bulk-avatar')->middleware('role:admin|it_support');
    Route::get('/settingsapp', [SettingAppController::class, 'edit'])->name('setting.edit');
    Route::post('/settingsapp', [SettingAppController::class, 'update'])->name('setting.update');
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->where('file', '.*')->name('backup.download');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->where('file', '.*')->name('backup.delete');
    Route::post('/backup/restore', [BackupController::class, 'restore'])
        ->middleware('role:admin')
        ->name('backup.restore');
    

    // Utilities > Trash
    Route::get('/utilities/trash', [UtilitiesTrashController::class, 'index'])->name('utilities.trash.index');
    Route::post('/utilities/trash/bulk-restore', [UtilitiesTrashController::class, 'bulkRestore'])->middleware('role:admin')->name('utilities.trash.bulkRestore');
    Route::post('/utilities/trash/bulk-force-delete', [UtilitiesTrashController::class, 'bulkForceDelete'])->middleware('role:admin')->name('utilities.trash.bulkForceDelete');
    Route::get('/files', [UserFileController::class, 'index'])->name('files.index');
    Route::post('/files', [UserFileController::class, 'store'])->name('files.store');
    Route::delete('/files/{id}', [UserFileController::class, 'destroy'])->name('files.destroy');
    Route::resource('media', MediaFolderController::class);

    // Employee Management Routes (define specific routes before resource to avoid conflicts)
    Route::get('employees/export/{format}', [EmployeeController::class, 'export'])->name('employees.export');
    Route::post('employees/import', [EmployeeController::class, 'import'])->name('employees.import')->withoutMiddleware('menu.permission');
    Route::get('employees/download-import-template', [EmployeeController::class, 'downloadImportTemplate'])->name('employees.download-import-template')->withoutMiddleware('menu.permission');
    Route::resource('employees', EmployeeController::class)->where(['employee' => '[0-9]+']);

    // Division Management Routes
    Route::resource('divisions', DivisionController::class);

    // Asset Category Management Routes
    Route::resource('asset-categories', AssetCategoryController::class);

    // Asset Management Routes (define specific routes before resource to avoid conflicts)
    Route::get('assets/export/{format}', [AssetController::class, 'export'])->name('assets.export');
    Route::post('assets/import', [AssetController::class, 'import'])->name('assets.import')->withoutMiddleware('menu.permission');
    Route::get('assets/download-import-template', [AssetController::class, 'downloadImportTemplate'])->name('assets.download-import-template')->withoutMiddleware('menu.permission');
    Route::post('assets/{asset}/transfer', [AssetController::class, 'transfer'])->name('assets.transfer');
    Route::resource('assets', AssetController::class)->where(['asset' => '[0-9]+']);

    // Brand Management Routes
    Route::resource('brands', BrandController::class); // New: Brand Management Routes

    // Locations Management Routes
    Route::resource('locations', LocationController::class);

    // Asset Movements Routes
    Route::resource('asset-movements', AssetMovementController::class)->parameters([
        'asset-movements' => 'movement'
    ]);
    Route::post('asset-movements/{movement}/approve', [AssetMovementController::class, 'approve'])->name('asset-movements.approve');
    Route::post('asset-movements/{movement}/reject', [AssetMovementController::class, 'reject'])->name('asset-movements.reject');

    // Vendors Routes
    Route::resource('vendors', VendorController::class);

    // Ticket Management Routes
    Route::resource('tickets', TicketController::class);
    Route::post('tickets/{ticket}/comments', [TicketController::class, 'addComment'])->name('tickets.comments');
    Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');

    // Reports (admin or it_support only)
    Route::middleware(['role:admin|it_support'])->group(function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/export/{type}/{format}', [ReportController::class, 'export'])->name('reports.export');
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('login-activities', [LoginActivityController::class, 'index'])->name('login-activities.index');
    });
});

// Notification routes (outside menu.permission, but requires auth)
Route::middleware(['auth'])->group(function () {
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.readAll');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
    // Async lookups for searchable comboboxes
    Route::get('/lookups/employees', [LookupController::class, 'employees'])->name('lookups.employees');
    Route::get('/lookups/locations', [LookupController::class, 'locations'])->name('lookups.locations');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';