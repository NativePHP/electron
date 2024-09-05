<?php

namespace Native\Electron\Traits;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;

trait SetsAppName
{
    protected function setAppName(bool $slugify = false): void
    {
        $packageJsonPath = __DIR__.'/../../resources/js/package.json';
        $packageJson = json_decode(file_get_contents($packageJsonPath), true);

        $name = config('app.name');

        if ($slugify) {
            $name = str($name)->lower()->kebab();
        }

        $packageJson['name'] = $name;

        file_put_contents($packageJsonPath, json_encode($packageJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }
}
