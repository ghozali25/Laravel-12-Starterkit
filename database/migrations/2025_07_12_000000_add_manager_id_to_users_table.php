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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('manager_id')
                  ->nullable()
                  ->constrained('users') // Self-referencing foreign key
                  ->onDelete('set null') // If a manager is deleted, set manager_id to null for their reports
                  ->after('address'); // Position after 'address'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('manager_id');
            $table->dropColumn('manager_id');
        });
    }
};