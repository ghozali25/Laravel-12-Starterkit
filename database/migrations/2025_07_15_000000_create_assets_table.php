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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_category_id')->constrained('asset_categories')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Employee who uses the asset
            $table->string('serial_number')->unique()->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_end_date')->nullable();
            $table->string('status')->default('available'); // e.g., available, assigned, in_repair, retired
            $table->text('notes')->nullable();
            $table->json('custom_fields_data')->nullable(); // Dynamic fields based on category
            $table->timestamp('last_used_at')->nullable(); // Timestamp for usage tracking
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};