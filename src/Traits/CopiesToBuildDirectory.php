<?php

namespace Native\Electron\Traits;

use RecursiveCallbackFilterIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;

trait CopiesToBuildDirectory
{
    abstract protected function buildPath(): string;

    const SKIP_PATTERNS = [
        // Skip .git and Dev directories
        '.git',
        'docker',
        'packages',

        // Only needed for local testing
        'vendor/nativephp/electron/vendor',
        'vendor/nativephp/laravel/vendor',

        'vendor/nativephp/php-bin',
        'vendor/nativephp/electron/bin',
        'vendor/nativephp/electron/resources',
        'node_modules',
        'dist',

        '**/.github',

        'database/*.sqlite',
        'database/*.sqlite-shm',
        'database/*.sqlite-wal',

        'storage/logs/*',
        'storage/views/*',
        'storage/sessions/*',
    ];

    protected function copyToBuildDirectory()
    {
        intro('Copying App to build directory...');

        $sourcePath = base_path();
        $buildPath = $this->buildPath();

        $this->removeDirectory($buildPath);
        mkdir($buildPath, 0755, true);

        // A filtered iterator that will exclude files matching our skip patterns
        $directory = new RecursiveDirectoryIterator($sourcePath, RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS);

        $filter = new RecursiveCallbackFilterIterator($directory, function ($current) {
            $relativePath = substr($current->getPathname(), strlen(base_path()) + 1);
            $patterns = config('nativephp.cleanup_exclude_files') + static::SKIP_PATTERNS;

            // Check each skip pattern against the current file/directory
            foreach ($patterns as $pattern) {
                // fnmatch supports glob patterns like "*.txt" or "cache/*"
                if (fnmatch($pattern, $relativePath)) {
                    return false;
                }
            }

            return true;
        });

        // Now we walk all directories & files and copy them over accordingly
        $iterator = new RecursiveIteratorIterator($filter, RecursiveIteratorIterator::SELF_FIRST);

        foreach ($iterator as $item) {
            $target = $buildPath.DIRECTORY_SEPARATOR.substr($item->getPathname(), strlen($sourcePath) + 1);

            if ($item->isDir()) {
                if (! is_dir($target)) {
                    mkdir($target, 0755, true);
                }

                continue;
            }

            copy($item->getPathname(), $target);
        }

        $this->keepRequiredDirectories();

        note('App copied');
    }

    private function removeDirectory($path)
    {
        if (! file_exists($path)) {
            return;
        }

        if (is_file($path) || is_link($path)) {
            return unlink($path);
        }

        $dir = dir($path);
        while (false !== $entry = $dir->read()) {
            if ($entry == '.' || $entry == '..') {
                continue;
            }

            $this->removeDirectory($path.DIRECTORY_SEPARATOR.$entry);
        }

        // Clean up
        $dir->close();
        rmdir($path);
    }

    private function keepRequiredDirectories()
    {
        // Electron build removes empty folders, so we have to create dummy files
        // dotfiles unfortunately don't work.
        $buildPath = $this->buildPath();

        file_put_contents("{$buildPath}/storage/framework/cache/_native.json", '{}');
        file_put_contents("{$buildPath}/storage/framework/sessions/_native.json", '{}');
        file_put_contents("{$buildPath}/storage/framework/testing/_native.json", '{}');
        file_put_contents("{$buildPath}/storage/framework/views/_native.json", '{}');
        file_put_contents("{$buildPath}/storage/app/public/_native.json", '{}');
        file_put_contents("{$buildPath}/storage/logs/_native.json", '{}');
    }
}
