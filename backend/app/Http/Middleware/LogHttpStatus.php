<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogHttpStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        logger()->info(sprintf(
            '%s %s %d',
            $request->method(),
            $request->path(),
            $response->getStatusCode()
        ));

        return $response;
    }
}