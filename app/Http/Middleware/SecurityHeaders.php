<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Core hardening headers
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'no-referrer-when-downgrade');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Permissions-Policy', "geolocation=(), microphone=(), camera=(), payment=()");

        // Minimal, safe-by-default CSP. Use report-only first if unsure.
        // Adjust domains if you load assets from CDNs.
        $local = app()->environment('local');
        if ($local) {
            // Allow Vite dev server and fonts.bunny.net during local development.
            // Use scheme-wide allowances to avoid IPv6 literal quirks in browsers.
            $csp = "default-src 'self'; "
                . "img-src 'self' data: blob:; "
                . "font-src 'self' data: https://fonts.bunny.net; "
                . "style-src 'self' 'unsafe-inline' https://fonts.bunny.net http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173 http:; "
                . "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.google.com https://www.gstatic.com http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173 http:; "
                . "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.google.com https://www.gstatic.com http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173 http:; "
                . "connect-src 'self' http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173 ws://localhost:5173 ws://127.0.0.1:5173 ws://[::1]:5173 http: ws:";
        } else {
            $csp = "default-src 'self'; "
                . "img-src 'self' data: blob:; "
                . "font-src 'self' data: https://fonts.bunny.net; "
                . "style-src 'self' 'unsafe-inline' https://fonts.bunny.net; "
                . "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; "
                . "script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; "
                . "connect-src 'self'";
        }

        // Use Content-Security-Policy-Report-Only initially to avoid breaking existing pages.
        $response->headers->set('Content-Security-Policy-Report-Only', $csp);

        return $response;
    }
}
