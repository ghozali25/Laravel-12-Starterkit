<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Asset;
use App\Models\AssetMovement;
use App\Models\Location;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Arr;

class AssetMovementSeeder extends Seeder
{
    public function run(): void
    {
        $assets = Asset::all();
        $users = User::select('id','name')->get();
        $locations = Location::select('id','name','type')->get();

        if ($assets->isEmpty()) {
            $this->command->warn('No assets found. Run AssetSeeder first.');
            return;
        }
        if ($users->isEmpty() && $locations->isEmpty()) {
            $this->command->warn('No users or locations found. Seed users/locations first.');
            return;
        }

        $admin = User::whereHas('roles', function($q){ $q->where('name','admin'); })->first();
        $requesterPool = $users->isNotEmpty() ? $users : collect([$admin])->filter();

        foreach ($assets as $asset) {
            $count = random_int(2, 6);

            // track current state to build a believable chain
            $currentUserId = $asset->user_id;
            $currentLocationId = $asset->current_location_id;

            // movements go back in time from now
            $baseTime = Carbon::now()->subDays(random_int(5, 90));

            for ($i = 0; $i < $count; $i++) {
                $baseTime = (clone $baseTime)->addDays(random_int(1, 7));

                $doUserMove = (bool) random_int(0, 1);
                $doLocationMove = (bool) random_int(0, 1);
                if (!$doUserMove && !$doLocationMove) {
                    $doUserMove = true; // ensure at least one change
                }

                $fromUserId = $currentUserId;
                $fromLocationId = $currentLocationId;

                $toUserId = $doUserMove && $users->isNotEmpty()
                    ? Arr::random($users->pluck('id')->all())
                    : $currentUserId;

                $toLocationId = $doLocationMove && $locations->isNotEmpty()
                    ? Arr::random($locations->pluck('id')->all())
                    : $currentLocationId;

                // sometimes unassign user
                if ($doUserMove && (bool) random_int(0, 3)) { // 75% keep assigned, 25% unassign
                    // keep $toUserId as set
                } else if ($doUserMove) {
                    $toUserId = null;
                }

                $status = Arr::random(['approved','approved','approved','pending','rejected']); // bias towards approved

                $movement = AssetMovement::create([
                    'asset_id' => $asset->id,
                    'from_location_id' => $fromLocationId,
                    'to_location_id' => $toLocationId,
                    'from_user_id' => $fromUserId,
                    'to_user_id' => $toUserId,
                    'reason' => fake()->sentence(),
                    'status' => $status,
                    'requested_by' => $requesterPool->isNotEmpty() ? Arr::random($requesterPool->pluck('id')->all()) : null,
                    'approved_by' => $status === 'approved' ? optional($admin)->id : null,
                    'approved_at' => $status === 'approved' ? (clone $baseTime)->addHours(random_int(1, 48)) : null,
                    'created_at' => (clone $baseTime),
                    'updated_at' => (clone $baseTime),
                ]);

                // if approved, reflect change to asset current state to keep chain coherent
                if ($status === 'approved') {
                    $currentUserId = $toUserId;
                    $currentLocationId = $toLocationId;
                }
            }
        }

        $this->command->info('Asset movements seeded successfully.');
    }
}
