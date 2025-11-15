<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('ticket_status_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id');
            $table->string('status');
            $table->timestamp('changed_at')->index();

            $table->index(['ticket_id', 'changed_at']);
        });

        // Backfill from existing tickets: initial status at created_at, and resolved_at if present
        if (Schema::hasTable('tickets')) {
            DB::table('tickets')->orderBy('id')->chunk(1000, function ($rows) {
                $insert = [];
                $now = now();
                foreach ($rows as $row) {
                    // Initial status at created_at
                    $insert[] = [
                        'ticket_id' => $row->id,
                        'status' => $row->status,
                        'changed_at' => $row->created_at ?? $now,
                    ];
                    // Optionally record resolved_at if exists and status is resolved
                    if (!empty($row->resolved_at)) {
                        $insert[] = [
                            'ticket_id' => $row->id,
                            'status' => 'resolved',
                            'changed_at' => $row->resolved_at,
                        ];
                    }
                }
                if (!empty($insert)) {
                    DB::table('ticket_status_histories')->insert($insert);
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_status_histories');
    }
};
