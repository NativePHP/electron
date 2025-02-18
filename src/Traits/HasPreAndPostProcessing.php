<?php

namespace Native\Electron\Traits;

use Illuminate\Contracts\Process\ProcessResult;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Process;

use function Laravel\Prompts\error;
use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;

trait HasPreAndPostProcessing
{
    public function preProcess(): void
    {
        $config = $this->getPrePostBuildConfig('prebuild');

        if (! $config instanceof Collection) {
            return;
        }

        intro('Running pre-process commands...');

        $config->each($this->getProcessCallback());

        outro('Pre-process commands completed.');
    }

    public function postProcess(): void
    {
        $config = $this->getPrePostBuildConfig('postbuild');

        if (! $config instanceof Collection) {
            return;
        }

        intro('Running post-process commands...');

        $config->each($this->getProcessCallback());

        outro('Post-process commands completed.');
    }

    private function formatConfigKey(string $configKey): string
    {
        return sprintf('nativephp.%s', $configKey);
    }

    private function executeCommand(mixed $command): ProcessResult
    {
        return Process::path(base_path())
            ->timeout(300)
            ->tty(\Symfony\Component\Process\Process::isTtySupported())
            ->run($command, function (string $type, string $output) {
                echo $output;
            });
    }

    protected function getPrePostBuildConfig(string $configKey): mixed
    {
        $config = config($this->formatConfigKey($configKey));

        if (is_array($config)) {
            // Filter out empty values
            return collect($config)
                ->filter(fn ($value) => ! empty($value));
        }

        return $config;
    }

    private function getProcessCallback(): callable
    {
        return function ($command) {
            note("Running command: {$command}");

            if (is_array($command)) {
                $command = implode(' && ', $command);
            }

            $result = $this->executeCommand($command);

            if (! $result->successful()) {
                error("Command failed: {$command}");

                return;
            }

            note("Command successful: {$command}");
        };
    }
}
