<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable CORS globally so frontend at localhost:5173 can access API
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // Avoid redirecting unauthenticated API requests to a non-existent 'login' route.
        // When null is returned here, Laravel will respond with 401 for guests instead of redirecting.
        $middleware->redirectGuestsTo(function ($request) {
            // For API routes and AJAX requests, prefer a JSON 401 response
            if ($request->expectsJson() || $request->is('api/*')) {
                return null;
            }
            // If you later add a web login page, return its URL here.
            return null;
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
