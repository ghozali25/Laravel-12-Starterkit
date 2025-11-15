<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ticket_status_histories') && Schema::hasTable('tickets')) {
            Schema::table('ticket_status_histories', function (Blueprint $table) {
                // Pastikan kolom ada, jika belum maka buat
                if (!Schema::hasColumn('ticket_status_histories', 'ticket_id')) {
                    $table->unsignedBigInteger('ticket_id')->index();
                }

                $table->foreign('ticket_id')
                    ->references('id')
                    ->on('tickets')
                    ->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ticket_status_histories')) {
            Schema::table('ticket_status_histories', function (Blueprint $table) {
                $table->dropForeign(['ticket_id']);
            });
        }
    }
};
