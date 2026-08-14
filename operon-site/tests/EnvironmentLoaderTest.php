<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';
$loaderFile = dirname(__DIR__) . '/public_html/app/Config/EnvironmentLoader.php';
if (is_file($loaderFile)) {
    require_once $loaderFile;
}

final class EnvironmentLoaderTest extends TestCase
{
    public function testLoadsProductionVariablesFromEnvFileWithoutOverwritingServerValues(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'operon-env-');
        file_put_contents($path, "APP_ENV=production\nDB_HOST=localhost\nDB_NAME=operon\nDB_USER=operon_user\nDB_PASS=secret\n");
        putenv('DB_HOST=panel-host');

        EnvironmentLoader::load($path);

        $this->assertSame('production', getenv('APP_ENV'));
        $this->assertSame('panel-host', getenv('DB_HOST'));
        $this->assertSame('operon', getenv('DB_NAME'));

        unlink($path);
        foreach (['APP_ENV', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'] as $key) {
            putenv($key);
        }
    }
}
