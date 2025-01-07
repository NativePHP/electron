<?php

namespace Native\Electron\Traits;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;

trait CleansEnvFile
{
    abstract protected function buildPath(): string;

    protected function cleanEnvFile(): void
    {
        intro('Cleaning .env file...');

        $envFile = str_replace(base_path(), $this->buildPath(), app()->environmentFilePath());
        $cleanUpKeys = config('nativephp.cleanup_env_keys', []);

        $contents = collect(file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES))
            ->filter(function (string $line) use ($cleanUpKeys) {
                $key = str($line)->before('=');

                return ! $key->is($cleanUpKeys)
                    && ! $key->startsWith('#');
            })
            ->join("\n");

        file_put_contents($envFile, $contents);

        note('File cleaned');
    }
}
