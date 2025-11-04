<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $q = Activity::with('causer');

        if ($search = $request->string('search')->toString()) {
            $q->where(function($w) use ($search) {
                $w->where('description', 'like', "%$search%")
                  ->orWhere('subject_type', 'like', "%$search%")
                  ->orWhere('event', 'like', "%$search%")
                  ->orWhereHas('causer', function($c) use ($search) {
                      $c->where('name', 'like', "%$search%");
                  });
            });
        }

        $logs = $q->orderByDesc('created_at')->paginate(20)->withQueryString();

        return Inertia::render('auditlogs/Index', [
            'logs' => $logs->through(function(Activity $a){
                return [
                    'id' => $a->id,
                    'description' => $a->description,
                    'event' => $a->event,
                    'causer' => $a->causer ? ['id' => $a->causer->id, 'name' => $a->causer->name] : null,
                    'subject_type' => $a->subject_type,
                    'subject_id' => $a->subject_id,
                    'properties' => $a->properties,
                    'created_at' => $a->created_at->toDateTimeString(),
                ];
            }),
            'filters' => $request->only(['search'])
        ]);
    }
}
