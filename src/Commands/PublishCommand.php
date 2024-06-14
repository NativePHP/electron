<?php

namespace Native\Electron\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Native\Electron\Concerns\LocatesPhpBinary;
use Native\Electron\Traits\OsAndArch;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\select;

class PublishCommand extends Command
{
    use LocatesPhpBinary;
    use OsAndArch;

    protected $signature = 'native:publish
        {os? : The operating system to build for (linux, mac, win)}
        {arch? : The Processor Architecture to build for (x64, x86, arm64)}';

    public function handle(): void
    {
        $this->info('Building and publishing NativePHP app…');

        if (! $os = $this->argument('os')) {
            // Dependos on available publish commands
            $os = select(
                label: 'Please select the operating system to build for',
                options: ['win', 'linux', 'mac'],
                default: $this->getDefaultOs(),
            );
        }

        // Depends on the currenty available php executables
        if (! $arch = $this->argument('arch')) {
            $arch = select(
                label: 'Please select Processor Architecture',
                options: ($a = $this->getArchForOs($os)),
                default: $a[0]
            );
            if ($arch == 'all') {
                $arch = '';
            }
        }

        Artisan::call("native:build", ['os'=>$os, 'arch' => $arch, 'pub' => true ], $this->output);
    }
}
