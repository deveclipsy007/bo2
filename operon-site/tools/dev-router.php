<?php

declare(strict_types=1);

$publicRoot = dirname(__DIR__) . '/public_html';
$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$publicFile = realpath($publicRoot . $requestPath);

if (
    $publicFile !== false
    && str_starts_with($publicFile, realpath($publicRoot) . DIRECTORY_SEPARATOR)
    && is_file($publicFile)
) {
    return false;
}

require $publicRoot . '/index.php';
