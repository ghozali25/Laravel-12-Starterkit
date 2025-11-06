<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\Loan;
use Illuminate\Support\Carbon;
use App\Models\SettingApp;

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

        // Dynamic backup scheduling based on admin settings
        $setting = SettingApp::first();
        if ($setting) {
            $freq = $setting->backup_schedule_frequency ?? 'off';
            $time = $setting->backup_schedule_time ?? '00:30'; // HH:MM 24h
            $weekday = $setting->backup_schedule_weekday;      // 0..6 (Sun..Sat)
            $monthday = $setting->backup_schedule_monthday;    // 1..31

            if ($freq === 'daily') {
                $schedule->command('backup:run', ['--only-db' => true, '--disable-notifications' => true])
                    ->dailyAt($time);
            } elseif ($freq === 'weekly' && $weekday !== null) {
                // weeklyOn: 0..6 (Mon..Sun) in Laravel; convert from 0=Sun..6=Sat to 1=Mon..7=Sun
                $laravelDow = $weekday === 0 ? 7 : $weekday; // Sun->7, Mon..Sat stay 1..6
                $schedule->command('backup:run', ['--only-db' => true, '--disable-notifications' => true])
                    ->weeklyOn($laravelDow, $time);
            } elseif ($freq === 'monthly' && $monthday !== null) {
                $schedule->command('backup:run', ['--only-db' => true, '--disable-notifications' => true])
                    ->monthlyOn($monthday, $time);
            }
        }
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
