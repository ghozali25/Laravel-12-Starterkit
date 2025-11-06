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
        $csp = "default-src 'self'; "
            . "img-src 'self' data: blob:; "
            . "font-src 'self' data:; "
            . "style-src 'self' 'unsafe-inline'; "
            . "script-src 'self' 'unsafe-inline'; "
            . "connect-src 'self'";

        // Use Content-Security-Policy-Report-Only initially to avoid breaking existing pages.
        $response->headers->set('Content-Security-Policy-Report-Only', $csp);

        return $response;
    }
}
