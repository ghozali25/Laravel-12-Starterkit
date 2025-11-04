<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrower_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('loaned_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('due_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->string('status')->default('ongoing'); // ongoing, returned, overdue, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
