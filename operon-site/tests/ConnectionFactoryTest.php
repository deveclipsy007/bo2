<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';
require_once dirname(__DIR__) . '/public_html/app/Database/DatabaseConfig.php';
$factoryFile = dirname(__DIR__) . '/public_html/app/Database/ConnectionFactory.php';
if (is_file($factoryFile)) {
    require_once $factoryFile;
}

final class ConnectionFactoryTest extends TestCase
{
    public function testCreatesConfiguredSQLiteConnection(): void
    {
        $path = sys_get_temp_dir() . '/operon-' . bin2hex(random_bytes(6)) . '.sqlite';
        $config = DatabaseConfig::fromEnvironment([
            'APP_ENV' => 'local',
            'DB_SQLITE_PATH' => $path,
        ]);

        $connection = ConnectionFactory::create($config);

        $this->assertSame('sqlite', $connection->getAttribute(PDO::ATTR_DRIVER_NAME));
        $this->assertSame('1', (string) $connection->query('PRAGMA foreign_keys')->fetchColumn());
        @unlink($path);
    }
}
