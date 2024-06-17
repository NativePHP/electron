<?php
namespace Native\Electron\Traits;

use Illuminate\Support\Facades\Storage;

use function Laravel\Prompts\select;
trait OsAndArch {

    // Available OS in Build and Publish commands
    protected function getAvailOs(): array {
        return $this->availOs;
    }

    protected function getDefaultOs(): string
    {
        return match (PHP_OS_FAMILY) {
            'Windows' => 'win',
            'Darwin' => 'mac',
            'Linux' => 'linux',
            default => 'all',
        };
    }

    protected function selectOs(string|null $os): string {
        $os = $os ?? false;
        if (! in_array($this->argument('os'), $this->getAvailOs()) || ! $os) {
            $os = select(
                label: 'Please select the operating system to build for',
                options: $this->getAvailOs(),
                default: $this->getDefaultOs(),
            );
        }
        return $os;
    }

    /**
     * Get Arch for selected os
     *
     * Make this dynamic at some point
     */
    protected function getArchForOs(string $os): array {
        return match ($os) {
            'win' => ['x64'],
            'mac' => ['x86', 'arm64', 'all'],
            'linux' => ['x64']
        };
    }

    // Depends on the currenty available php executables
    protected function selectArchForOs(string $os, string|null $arch): string {
        $arch = $arch ?? false;
        if (!in_array($this->argument('arch'), ($a = $this->getArchForOs($os))) || ! $arch) {
            $arch = select(
                label: 'Please select Processor Architecture',
                options: $a,
                default: $a[0]
            );
            if ($arch == 'all') {
                $arch = '';
            }
        }
        return $arch;
    }
}
