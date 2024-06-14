<?php
namespace Native\Electron\Traits;

use Illuminate\Support\Facades\Storage;

trait OsAndArch {
    protected function getDefaultOs(): string
    {
        return match (PHP_OS_FAMILY) {
            'Windows' => 'win',
            'Darwin' => 'mac',
            'Linux' => 'linux',
            default => 'all',
        };
    }

    protected function getArchForOs(string $os): array {
        return match ($os) {
            'win' => ['x64'],
            'mac' => ['x86', 'arm64', 'all'],
            'linux' => ['x64']
        };
    }
}
