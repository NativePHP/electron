<?php

namespace Native\Electron\Traits;

use Illuminate\Support\Facades\Process;
use Symfony\Component\Filesystem\Filesystem;

use function Laravel\Prompts\intro;

trait PrunesVendorDirectory
{
    abstract protected function buildPath(): string;

    protected function pruneVendorDirectory()
    {
        intro('Pruning vendor directory');

        Process::path($this->buildPath())
            ->run('composer install --no-dev', function (string $type, string $output) {
                echo $output;
            });

        $filesystem = new Filesystem;
        $filesystem->remove("{$this->buildPath()}/vendor/bin");
    }
}
