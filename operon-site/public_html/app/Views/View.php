<?php

declare(strict_types=1);

final class View
{
    /** @param array<string, mixed> $data */
    public static function render(string $name, array $data = []): void
    {
        $viewFile = __DIR__ . '/pages/' . $name . '.php';
        if (!is_file($viewFile)) {
            http_response_code(404);
            $viewFile = __DIR__ . '/pages/404.php';
        }

        extract($data, EXTR_SKIP);
        ob_start();
        require $viewFile;
        $content = (string) ob_get_clean();
        require __DIR__ . '/layout.php';
    }
}
