<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('daily_ticket_status_metrics', function (Blueprint $table) {
            $table->date('date')->primary();
            $table->unsignedInteger('open')->default(0);
            $table->unsignedInteger('in_progress')->default(0);
            $table->unsignedInteger('resolved')->default(0);
            $table->unsignedInteger('closed')->default(0);
            $table->unsignedInteger('cancelled')->default(0);
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_ticket_status_metrics');
    }
};
