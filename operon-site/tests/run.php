<?php

declare(strict_types=1);

require_once __DIR__ . '/DatabaseConfigTest.php';
require_once __DIR__ . '/ProjectStructureTest.php';
require_once __DIR__ . '/RouterTest.php';
require_once __DIR__ . '/ConnectionFactoryTest.php';
require_once __DIR__ . '/DiagnosticLeadRepositoryTest.php';
require_once __DIR__ . '/DevServerTest.php';
require_once __DIR__ . '/MotionSystemTest.php';
require_once __DIR__ . '/EnvironmentLoaderTest.php';

$testClasses = [
    DatabaseConfigTest::class,
    ProjectStructureTest::class,
    RouterTest::class,
    ConnectionFactoryTest::class,
    DiagnosticLeadRepositoryTest::class,
    DevServerTest::class,
    MotionSystemTest::class,
    EnvironmentLoaderTest::class,
];
$failures = 0;
$executed = 0;

foreach ($testClasses as $testClass) {
    $instance = new $testClass();

    foreach (get_class_methods($instance) as $method) {
        if (!str_starts_with($method, 'test')) {
            continue;
        }

        $executed++;

        try {
            $instance->{$method}();
            fwrite(STDOUT, "PASS {$testClass}::{$method}\n");
        } catch (Throwable $exception) {
            $failures++;
            fwrite(STDERR, "FAIL {$testClass}::{$method} — {$exception->getMessage()}\n");
        }
    }
}

fwrite(STDOUT, sprintf("\n%d tests, %d failures\n", $executed, $failures));
exit($failures === 0 ? 0 : 1);
