<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('settingapp')) {
            Schema::table('settingapp', function (Blueprint $table) {
                if (!Schema::hasColumn('settingapp', 'backup_schedule_frequency')) {
                    $table->enum('backup_schedule_frequency', ['off','daily','weekly','monthly'])->default('off');
                }
                if (!Schema::hasColumn('settingapp', 'backup_schedule_time')) {
                    $table->string('backup_schedule_time', 5)->default('00:30'); // HH:MM 24h
                }
                if (!Schema::hasColumn('settingapp', 'backup_schedule_weekday')) {
                    $table->unsignedTinyInteger('backup_schedule_weekday')->nullable(); // 0=Sun .. 6=Sat
                }
                if (!Schema::hasColumn('settingapp', 'backup_schedule_monthday')) {
                    $table->unsignedTinyInteger('backup_schedule_monthday')->nullable(); // 1..28/31
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('settingapp')) {
            Schema::table('settingapp', function (Blueprint $table) {
                if (Schema::hasColumn('settingapp', 'backup_schedule_frequency')) {
                    $table->dropColumn('backup_schedule_frequency');
                }
                if (Schema::hasColumn('settingapp', 'backup_schedule_time')) {
                    $table->dropColumn('backup_schedule_time');
                }
                if (Schema::hasColumn('settingapp', 'backup_schedule_weekday')) {
                    $table->dropColumn('backup_schedule_weekday');
                }
                if (Schema::hasColumn('settingapp', 'backup_schedule_monthday')) {
                    $table->dropColumn('backup_schedule_monthday');
                }
            });
        }
    }
};
