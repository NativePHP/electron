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
    protected function preProcess(string $configKey): void
    {
        $config = $this->getConfig($configKey);

        if (! $config instanceof Collection
            || empty($config->get('before'))
        ) {
            return;
        }

        intro('Running pre-process commands...');

        $config->get('before', collect())
            ->each($this->getProcessCallback());

        outro('Pre-process commands completed.');
    }

    protected function postProcess(string $configKey): void
    {
        $config = $this->getConfig($configKey);

        if (! $config instanceof Collection
            || empty($config->get('after'))
        ) {
            return;
        }

        intro('Running post-process commands...');

        $config->get('after', collect())
            ->each($this->getProcessCallback());

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
            ->tty(\Symfony\Component\Process\Process::isTtySupported() && ! $this->option('no-interaction'))
            ->run($command, function (string $type, string $output) {
                echo $output;
            });
    }

    private function getConfig(string $configKey): mixed
    {
        $config = config($this->formatConfigKey($configKey));

        if (is_array($config)) {
            return collect($config)
                ->map(fn ($value) => is_array($value) ? collect($value) : $value);
        }

        return $config;
    }

    private function getProcessCallback(): callable
    {
        return function ($command) {
            note("Running command: {$command}");
            $result = $this->executeCommand($command);

            if (! $result->successful()) {
                error("Command failed: {$command}");
                return;
            }

            note("Command successful: {$command}");
        };
    }
}
