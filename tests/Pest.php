<?php

use Native\Electron\Tests\TestCase;

uses(TestCase::class)->in(__DIR__);

function stopIfConditionFails(bool $condition, string $message): void
{
    if (!$condition) {
        test()->markTestSkipped($message);
        exit(1); // Stop all remaining tests
    }
}
