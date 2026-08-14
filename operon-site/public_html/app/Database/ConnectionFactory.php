<?php

declare(strict_types=1);

final class ConnectionFactory
{
    public static function create(DatabaseConfig $config): PDO
    {
        if ($config->driver === 'sqlite') {
            $directory = dirname($config->sqlitePath);
            if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
                throw new RuntimeException("Unable to create SQLite directory: {$directory}");
            }
        }

        $connection = new PDO(
            $config->dsn(),
            $config->driver === 'mysql' ? $config->username : null,
            $config->driver === 'mysql' ? $config->password : null,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ],
        );

        if ($config->driver === 'sqlite') {
            $connection->exec('PRAGMA foreign_keys = ON');
            $connection->exec('PRAGMA journal_mode = WAL');
        }

        return $connection;
    }
}
