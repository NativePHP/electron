<?php

namespace Native\Electron\Traits;

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Facades\Process;
use Symfony\Component\Process\Process as SymfonyProcess;

/**
 * Trait ManagesAssetBuilding
 */
trait ManagesAssetBuilding
{
    protected function detectNpmScripts()
    {
        $filePath = base_path('package.json');

        if (! file_exists($filePath)) {
            return [];
        }

        $packageFile = json_decode(file_get_contents($filePath), true);

        return $packageFile['scripts'] ?? [];
    }

    public function checkAndBuildProjectAssets(?string $buildCommand): ?ProcessResult
    {
        $scripts = $this->detectNpmScripts();

        if (empty($scripts)) {
            return null;
        }

        if (is_null($buildCommand)) {
            $runBuild = $this->confirm(
                'We\'ve detected some NPM scripts in your project. Would you like to build your project assets?',
                false
            );

            if (! $runBuild) {
                return null;
            }

            $buildCommand = $this->promptForAssetBuildCommand($scripts);
        }

        if (! isset($scripts[$buildCommand])) {
            // We might get here if the script wasn't defined and the default was used.
            // We can try to prompt the user again.
            $buildCommand = $this->promptForAssetBuildCommand($scripts);

            if (! isset($scripts[$buildCommand])) {
                $this->error('Invalid script selected. Exiting…');

                return null;
            }
        }

        $this->info('Building project assets…');

        return $this->runProcess("npm run $buildCommand");
    }

    private function promptForAssetBuildCommand(array $scripts): string
    {
        $this->info('Available NPM scripts:');

        foreach ($scripts as $script => $command) {
            $this->line("{$script}: {$command}");
        }

        return $this->choice('Which script would you like to run?', $scripts);
    }

    private function runProcess(string $command): ProcessResult
    {
        // Run the process
        return Process::path(base_path())
            ->forever()
            ->tty(SymfonyProcess::isTtySupported() && ! $this->option('no-interaction'))
            ->run($command, function (string $type, string $output) {
                echo $output;
            });
    }
}
