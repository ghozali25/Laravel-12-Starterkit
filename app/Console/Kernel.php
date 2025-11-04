<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\Loan;
use Illuminate\Support\Carbon;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Run metrics rebuild daily at 00:05 WIB
        $schedule->command('metrics:rebuild-daily-ticket-status')
            ->dailyAt('00:05');

        // Mark overdue loans daily at 00:10
        $schedule->call(function () {
            Loan::where('status', 'ongoing')
                ->whereNotNull('due_at')
                ->where('due_at', '<', now())
                ->update(['status' => 'overdue']);
        })->dailyAt('00:10');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
