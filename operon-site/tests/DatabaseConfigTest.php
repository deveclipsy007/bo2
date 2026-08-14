<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';
$databaseConfigFile = dirname(__DIR__) . '/public_html/app/Database/DatabaseConfig.php';
if (is_file($databaseConfigFile)) {
    require_once $databaseConfigFile;
}

final class DatabaseConfigTest extends TestCase
{
    public function testLocalEnvironmentUsesSQLite(): void
    {
        $config = DatabaseConfig::fromEnvironment([
            'APP_ENV' => 'local',
            'DB_SQLITE_PATH' => '/tmp/operon-test.sqlite',
        ]);

        $this->assertSame('sqlite', $config->driver);
        $this->assertSame('sqlite:/tmp/operon-test.sqlite', $config->dsn());
    }

    public function testProductionEnvironmentUsesMySQL(): void
    {
        $config = DatabaseConfig::fromEnvironment([
            'APP_ENV' => 'production',
            'DB_HOST' => 'localhost',
            'DB_PORT' => '3306',
            'DB_NAME' => 'operon',
            'DB_USER' => 'operon_user',
            'DB_PASS' => 'secret',
        ]);

        $this->assertSame('mysql', $config->driver);
        $this->assertSame(
            'mysql:host=localhost;port=3306;dbname=operon;charset=utf8mb4',
            $config->dsn()
        );
    }

    public function testProductionRejectsMissingMySQLConfiguration(): void
    {
        try {
            DatabaseConfig::fromEnvironment(['APP_ENV' => 'production']);
        } catch (InvalidArgumentException $exception) {
            $this->assertTrue(str_contains($exception->getMessage(), 'DB_HOST'));
            return;
        }

        throw new RuntimeException('Production configuration should reject missing MySQL settings');
    }
}
