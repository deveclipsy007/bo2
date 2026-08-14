<?php

declare(strict_types=1);

final readonly class DatabaseConfig
{
    private function __construct(
        public string $driver,
        public string $host,
        public int $port,
        public string $database,
        public string $username,
        public string $password,
        public string $sqlitePath,
    ) {
    }

    /** @param array<string, string> $environment */
    public static function fromEnvironment(array $environment): self
    {
        $appEnvironment = strtolower(trim($environment['APP_ENV'] ?? 'local'));

        if ($appEnvironment !== 'production') {
            $path = trim($environment['DB_SQLITE_PATH'] ?? 'storage/database/operon.sqlite');

            if ($path === '') {
                throw new InvalidArgumentException('DB_SQLITE_PATH cannot be empty');
            }

            return new self('sqlite', '', 0, '', '', '', $path);
        }

        foreach (['DB_HOST', 'DB_NAME', 'DB_USER'] as $required) {
            if (trim($environment[$required] ?? '') === '') {
                throw new InvalidArgumentException("{$required} is required in production");
            }
        }

        return new self(
            'mysql',
            trim($environment['DB_HOST']),
            (int) ($environment['DB_PORT'] ?? 3306),
            trim($environment['DB_NAME']),
            trim($environment['DB_USER']),
            $environment['DB_PASS'] ?? '',
            '',
        );
    }

    public function dsn(): string
    {
        if ($this->driver === 'sqlite') {
            return 'sqlite:' . $this->sqlitePath;
        }

        return sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $this->host,
            $this->port,
            $this->database,
        );
    }
}
