<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\RedirectResponse;

class LanguageController extends Controller
{
    /**
     * Set the application locale.
     */
    public function setLocale(Request $request, string $locale): RedirectResponse
    {
        if (! in_array($locale, ['en', 'id'])) {
            abort(400); // Invalid locale
        }

        Session::put('locale', $locale);

        return back();
    }
}