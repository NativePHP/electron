<?php

namespace Native\Electron\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;
use Native\Electron\Concerns\LocatesPhpBinary;
use Native\Electron\Facades\Updater;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\select;

class BuildCommand extends Command
{
    use LocatesPhpBinary;

    protected $signature = 'native:build
        {os? : The operating system to build for (all, linux, mac, win)}
        {arch? : The Processor Architecture to build for (x64, x86, arm64)}
        {pub? : Publish the app (false, true)}';

    public function handle(): void
    {
        $this->info('Build NativePHP app…');

        // Process::path(__DIR__.'/../../resources/js/')
        //     ->env($this->getEnvironmentVariables())
        //     ->forever()
        //     ->run('npm update', function (string $type, string $output) {
        //         echo $output;
        //     });

        Process::path(base_path())
            ->run('composer install --no-dev', function (string $type, string $output) {
                echo $output;
            });

        if (! $os = $this->argument('os')) {
            $os = select(
                label: 'Please select the operating system to build for',
                options: ['win', 'linux', 'mac', 'all'],
                default: $this->getDefaultOs(),
            );
        }

        $arch = '';
        $publish = 'build';
        if ($os != 'all') {
            if (! $arch = $this->argument('arch')) {
                $availOsArch = [
                    'win' => ['-x64'],
                    'mac' => ['-x86', '-arm', 'all'],
                    'linux' => ['-x64']
                ];
                $arch = select(
                    label: 'Please select Processor Architecture',
                    options: $availOsArch[$os],
                    default: $availOsArch[$os][0]
                );
                if ($arch == 'all') {
                    $arch = '';
                }
            }
            if (! $publish = $this->argument('pub')) {
                $publish = confirm(
                    label: 'Should the App be published?',
                    default: false
                )
                ? 'publish'
                : 'build' ;
            }
        }

        Process::path(__DIR__.'/../../resources/js/')
            ->env($this->getEnvironmentVariables())
            ->forever()
            ->tty(PHP_OS_FAMILY != 'Windows' && ! $this->option('no-interaction'))
            ->run("npm run {$publish}:{$os}{$arch}", function (string $type, string $output) {
                echo $output;
            });
    }

    protected function getEnvironmentVariables(): array
    {
        return array_merge(
            [
                'APP_PATH' => base_path(),
                'APP_URL' => config('app.url'),
                'NATIVEPHP_BUILDING' => true,
                'NATIVEPHP_PHP_BINARY_VERSION' => PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION,
                'NATIVEPHP_PHP_BINARY_PATH' => base_path($this->phpBinaryPath()),
                'NATIVEPHP_CERTIFICATE_FILE_PATH' => base_path($this->binaryPackageDirectory().'cacert.pem'),
                'NATIVEPHP_APP_NAME' => config('app.name'),
                'NATIVEPHP_APP_ID' => config('nativephp.app_id'),
                'NATIVEPHP_APP_VERSION' => config('nativephp.version'),
                'NATIVEPHP_APP_FILENAME' => Str::slug(config('app.name')),
                'NATIVEPHP_APP_AUTHOR' => config('nativephp.author'),
                'NATIVEPHP_UPDATER_CONFIG' => json_encode(Updater::builderOptions()),
            ],
            Updater::environmentVariables(),
        );
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
}
