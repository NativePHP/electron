<?php

namespace Native\Electron\Traits;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;

trait CleansEnvFile
{
    const OVERRIDE_KEYS = [
        'LOG_CHANNEL',
        'LOG_STACK',
        'LOG_DAILY_DAYS'
    ];

    abstract protected function buildPath(): string;

    protected function cleanEnvFile(): void
    {
        intro('Cleaning .env file...');

        $cleanUpKeys = array_merge(self::OVERRIDE_KEYS, config('nativephp.cleanup_env_keys', []));

        $envFile = str_replace(base_path(), $this->buildPath(), app()->environmentFilePath());

        $contents = collect(file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES))
            // Remove cleanup keys
            ->filter(function (string $line) use ($cleanUpKeys) {
                $key = str($line)->before('=');

                return ! $key->is($cleanUpKeys)
                    && ! $key->startsWith('#');
            })
            // Set defaults (other config overrides are handled in the NativeServiceProvider)
            // The Log channel needs to be configured before anything else.
            ->push('LOG_CHANNEL=stack')
            ->push('LOG_STACK=daily')
            ->push('LOG_DAILY_DAYS=3')
            ->join("\n");

        file_put_contents($envFile, $contents);

        note('File cleaned');
    }
}
