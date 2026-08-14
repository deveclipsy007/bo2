<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';

final class DevServerTest extends TestCase
{
    public function testDevelopmentRouterLetsStaticFilesPassThrough(): void
    {
        $router = dirname(__DIR__) . '/tools/dev-router.php';
        $this->assertTrue(is_file($router), 'Development router is missing');
        $source = file_get_contents($router);
        $this->assertTrue(str_contains($source, 'is_file($publicFile)'));
        $this->assertTrue(str_contains($source, 'return false'));
    }
}
