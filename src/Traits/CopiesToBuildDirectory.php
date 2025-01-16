<?php

/**
 * This trait is responsible for copying over the app to the build directory.
 * It skips any ignored paths/globs during the copy step
 *
 * TODO: When more drivers/adapters are added, this should be relocated
 */

namespace Native\Electron\Traits;

use RecursiveIteratorIterator;
use RecursiveDirectoryIterator;

use RecursiveCallbackFilterIterator;
use Symfony\Component\Filesystem\Filesystem;

trait CopiesToBuildDirectory
{
    abstract protected function buildPath(): string;
    abstract protected function sourcePath(string $path  = ''): string;

    public function copyToBuildDirectory()
    {
        $sourcePath = $this->sourcePath();
        $buildPath = $this->buildPath();
        $filesystem = new Filesystem;

        $patterns = array_merge(
            config('nativephp-internal.cleanup_exclude_files', []),
            self::CLEANUP_EXCLUDE_FILES
        );

        // Clean and create build directory
        $filesystem->remove($buildPath);
        $filesystem->mkdir($buildPath);

        // A filtered iterator that will exclude files matching our skip patterns
        $directory = new RecursiveDirectoryIterator($sourcePath, RecursiveDirectoryIterator::SKIP_DOTS | RecursiveDirectoryIterator::FOLLOW_SYMLINKS);

        $filter = new RecursiveCallbackFilterIterator($directory, function ($current) use ($patterns) {
            $relativePath = substr($current->getPathname(), strlen($this->sourcePath()) + 1);

            // Check each skip pattern against the current file/directory
            foreach ($patterns as $pattern) {

                // fnmatch supports glob patterns like "*.txt" or "cache/*"
                if (fnmatch($pattern, $relativePath)) {
                    // dump('false: ' . $relativePath);
                    return false;
                }
            }
            // dump($patterns);
            // dump('true: ' .$relativePath);
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
    }

    private function keepRequiredDirectories()
    {
        // Electron build removes empty folders, so we have to create dummy files
        // dotfiles unfortunately don't work.
        $filesystem = new Filesystem;
        $buildPath = $this->buildPath();

        $filesystem->dumpFile("{$buildPath}/storage/framework/cache/_native.json", '{}');
        $filesystem->dumpFile("{$buildPath}/storage/framework/sessions/_native.json", '{}');
        $filesystem->dumpFile("{$buildPath}/storage/framework/testing/_native.json", '{}');
        $filesystem->dumpFile("{$buildPath}/storage/framework/views/_native.json", '{}');
        $filesystem->dumpFile("{$buildPath}/storage/app/public/_native.json", '{}');
        $filesystem->dumpFile("{$buildPath}/storage/logs/_native.json", '{}');
    }
}
