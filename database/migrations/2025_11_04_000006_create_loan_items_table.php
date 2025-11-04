<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained('loans')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('condition_out')->nullable();
            $table->string('condition_in')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();
            $table->unique(['loan_id', 'asset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_items');
    }
};
