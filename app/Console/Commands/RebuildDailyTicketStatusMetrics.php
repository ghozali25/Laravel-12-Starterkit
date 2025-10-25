<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class RebuildDailyTicketStatusMetrics extends Command
{
    protected $signature = 'metrics:rebuild-daily-ticket-status';
    protected $description = 'Rebuild daily ticket status metrics for the current month (Asia/Jakarta)';

    public function handle(): int
    {
        $tz = config('app.timezone', 'Asia/Jakarta');
        $startOfMonth = Carbon::now($tz)->startOfMonth();
        $today = Carbon::now($tz)->toDateString();

        // Get distinct dates list for month up to today
        $dates = [];
        for ($d = $startOfMonth->copy(); $d->lte(Carbon::now($tz)); $d->addDay()) {
            $dates[] = $d->format('Y-m-d');
        }

        $statuses = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

        DB::transaction(function () use ($dates, $statuses, $tz) {
            foreach ($dates as $date) {
                $endOfDay = Carbon::parse($date, $tz)->endOfDay();
                $rows = DB::select(<<<SQL
                    WITH latest AS (
                      SELECT ticket_id, status, changed_at,
                             ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY changed_at DESC) rn
                      FROM ticket_status_histories
                      WHERE changed_at <= ?
                    )
                    SELECT status, COUNT(*) as c
                    FROM latest
                    WHERE rn = 1
                    GROUP BY status
                SQL, [$endOfDay]);

                $data = array_fill_keys($statuses, 0);
                foreach ($rows as $r) {
                    if (isset($data[$r->status])) {
                        $data[$r->status] = (int) $r->c;
                    }
                }

                DB::table('daily_ticket_status_metrics')->updateOrInsert(
                    ['date' => $date],
                    [
                        'open' => $data['open'],
                        'in_progress' => $data['in_progress'],
                        'resolved' => $data['resolved'],
                        'closed' => $data['closed'],
                        'cancelled' => $data['cancelled'],
                        'updated_at' => now($tz),
                    ]
                );
            }
        });

        // Invalidate dashboard cache for this month
        $cacheKey = 'dashboard:dailyTicketStatus:' . Carbon::now($tz)->format('Y-m');
        Cache::forget($cacheKey);

        $this->info('Daily ticket status metrics rebuilt for current month.');
        return Command::SUCCESS;
    }
}
