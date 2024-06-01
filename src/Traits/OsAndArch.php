<?php
namespace Native\Electron\Traits;

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
            'win' => ['-x64'],
            'mac' => ['-x86', '-arm', 'all'],
            'linux' => ['-x64']
        };
    }
}
