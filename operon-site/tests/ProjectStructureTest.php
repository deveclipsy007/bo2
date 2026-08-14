<?php

declare(strict_types=1);

require_once __DIR__ . '/TestCase.php';

final class ProjectStructureTest extends TestCase
{
    public function testSharedHostingEntryPointsExist(): void
    {
        $publicRoot = dirname(__DIR__) . '/public_html';

        $this->assertTrue(is_file($publicRoot . '/index.php'));
        $this->assertTrue(is_file($publicRoot . '/.htaccess'));
        $this->assertTrue(is_dir($publicRoot . '/assets/css'));
        $this->assertTrue(is_dir($publicRoot . '/assets/js'));
        $this->assertTrue(is_dir($publicRoot . '/assets/images'));
    }

    public function testSensitiveFoldersAreDeniedByApache(): void
    {
        $rules = file_get_contents(dirname(__DIR__) . '/public_html/.htaccess');

        $this->assertTrue(str_contains($rules, 'RewriteRule ^(?:app|config|database|storage|tests|vendor)/ - [F,L,NC]'));
        $this->assertTrue(str_contains($rules, 'FilesMatch'));
        $this->assertTrue(str_contains($rules, '.env'));
    }
}
