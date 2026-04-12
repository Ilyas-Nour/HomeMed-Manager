<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequestTimer
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = microtime(true) - $start;

        $response->headers->set('X-Laravel-Duration', round($duration * 1000, 2) . 'ms');
        $response->headers->set('X-Laravel-PID', getmypid());

        return $response;
    }
}
