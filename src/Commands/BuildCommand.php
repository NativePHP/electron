<?php

namespace Native\Electron\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;
use Native\Electron\Facades\Updater;
use Native\Electron\Traits\CleansEnvFile;
use Native\Electron\Traits\CopiesCertificateAuthority;
use Native\Electron\Traits\CopiesToBuildDirectory;
use Native\Electron\Traits\HasPreAndPostProcessing;
use Native\Electron\Traits\InstallsAppIcon;
use Native\Electron\Traits\LocatesPhpBinary;
use Native\Electron\Traits\OsAndArch;
use Native\Electron\Traits\PrunesVendorDirectory;
use Native\Electron\Traits\SetsAppName;
use Symfony\Component\Process\Process as SymfonyProcess;

use function Laravel\Prompts\intro;

class BuildCommand extends Command
{
    use CleansEnvFile;
    use CopiesCertificateAuthority;
    use CopiesToBuildDirectory;
    use HasPreAndPostProcessing;
    use InstallsAppIcon;
    use LocatesPhpBinary;
    use OsAndArch;
    use PrunesVendorDirectory;
    use SetsAppName;

    protected $signature = 'native:build
        {os? : The operating system to build for (all, linux, mac, win)}
        {arch? : The Processor Architecture to build for (x64, x86, arm64)}
        {--publish : to publish the app}';

    protected $availableOs = ['win', 'linux', 'mac', 'all'];

    protected function buildPath(string $path = ''): string
    {
        return __DIR__.'/../../resources/js/resources/app/'.$path;
    }

    protected function sourcePath(string $path = ''): string
    {
        return base_path($path);
    }

    public function handle(): void
    {
        $os = $this->selectOs($this->argument('os'));

        $buildCommand = 'build';
        if ($os != 'all') {
            $arch = $this->selectArchitectureForOs($os, $this->argument('arch'));

            $os .= $arch != 'all' ? "-{$arch}" : '';

            // Should we publish?
            if ($publish = $this->option('publish')) {
                $buildCommand = 'publish';
            }
        }

        $this->preProcess();

        $this->setAppName(slugify: true);

        $this->newLine();
        intro('Updating Electron dependencies...');
        Process::path(__DIR__.'/../../resources/js/')
            ->env($this->getEnvironmentVariables())
            ->forever()
            ->run('npm ci', function (string $type, string $output) {
                echo $output;
            });

        $this->newLine();
        intro('Copying App to build directory...');
        $this->copyToBuildDirectory();

        $this->newLine();
        $this->copyCertificateAuthorityCertificate();

        $this->newLine();
        intro('Cleaning .env file...');
        $this->cleanEnvFile();

        $this->newLine();
        intro('Copying app icons...');
        $this->installIcon();

        $this->newLine();
        intro('Pruning vendor directory');
        $this->pruneVendorDirectory();

        $this->newLine();
        intro((($publish ?? false) ? 'Publishing' : 'Building')." for {$os}");
        Process::path(__DIR__.'/../../resources/js/')
            ->env($this->getEnvironmentVariables())
            ->forever()
            ->tty(SymfonyProcess::isTtySupported() && ! $this->option('no-interaction'))
            ->run("npm run {$buildCommand}:{$os}", function (string $type, string $output) {
                echo $output;
            });

        $this->postProcess();
    }

    protected function getEnvironmentVariables(): array
    {
        return array_merge(
            [
                'APP_PATH' => $this->sourcePath(),
                'APP_URL' => config('app.url'),
                'NATIVEPHP_BUILDING' => true,
                'NATIVEPHP_PHP_BINARY_VERSION' => PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION,
                'NATIVEPHP_PHP_BINARY_PATH' => $this->sourcePath($this->phpBinaryPath()),
                'NATIVEPHP_APP_NAME' => config('app.name'),
                'NATIVEPHP_APP_ID' => config('nativephp.app_id'),
                'NATIVEPHP_APP_VERSION' => config('nativephp.version'),
                'NATIVEPHP_APP_FILENAME' => Str::slug(config('app.name')),
                'NATIVEPHP_APP_AUTHOR' => config('nativephp.author'),
                'NATIVEPHP_UPDATER_CONFIG' => json_encode(Updater::builderOptions()),
                'NATIVEPHP_DEEPLINK_SCHEME' => config('nativephp.deeplink_scheme'),
            ],
            Updater::environmentVariables(),
        );
    }
}
