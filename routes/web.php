<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\UserFileController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\SettingAppController;
use App\Http\Controllers\MediaFolderController;
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

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup/run', [BackupController::class, 'run'])->name('backup.run');
    Route::get('/backup/download/{file}', [BackupController::class, 'download'])->name('backup.download');
    Route::delete('/backup/delete/{file}', [BackupController::class, 'delete'])->name('backup.delete');
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
    Route::resource('assets', AssetController::class)->where(['asset' => '[0-9]+']);

    // Brand Management Routes
    Route::resource('brands', BrandController::class); // New: Brand Management Routes

    // Locations Management Routes
    Route::resource('locations', LocationController::class);

    // Ticket Management Routes
    Route::resource('tickets', TicketController::class);
    Route::post('tickets/{ticket}/comments', [TicketController::class, 'addComment'])->name('tickets.comments');
    Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');

    // Reports (admin or it_support only)
    Route::middleware(['role:admin|it_support'])->group(function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/export/{type}/{format}', [ReportController::class, 'export'])->name('reports.export');
    });
});

// Notification routes (outside menu.permission, but requires auth)
Route::middleware(['auth'])->group(function () {
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.readAll');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';