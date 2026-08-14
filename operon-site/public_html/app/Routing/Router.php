<?php

declare(strict_types=1);

final class Router
{
    /** @param array<string, string> $routes */
    public function __construct(private readonly array $routes)
    {
    }

    public function resolve(string $uri): string
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $path = '/' . trim($path, '/');
        $path = $path === '/' ? '/' : rtrim($path, '/');

        return $this->routes[$path] ?? '404';
    }
}
