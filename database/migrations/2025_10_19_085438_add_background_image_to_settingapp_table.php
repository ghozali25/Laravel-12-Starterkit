<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('settingapp', function (Blueprint $table) {
        $table->string('background_image')->nullable()->after('favicon');
    });
}

public function down(): void
{
    Schema::table('settingapp', function (Blueprint $table) {
        $table->dropColumn('background_image');
    });
}
};
