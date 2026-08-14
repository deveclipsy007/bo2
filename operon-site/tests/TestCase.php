<?php

declare(strict_types=1);

abstract class TestCase
{
    protected function assertSame(mixed $expected, mixed $actual, string $message = ''): void
    {
        if ($expected !== $actual) {
            throw new RuntimeException($message ?: sprintf(
                "Expected %s, got %s",
                var_export($expected, true),
                var_export($actual, true)
            ));
        }
    }

    protected function assertTrue(bool $condition, string $message = ''): void
    {
        if (!$condition) {
            throw new RuntimeException($message ?: 'Expected condition to be true');
        }
    }
}
