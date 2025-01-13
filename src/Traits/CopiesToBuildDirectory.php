<?php

namespace Native\Electron\Traits;

use function Laravel\Prompts\note;
use function Laravel\Prompts\intro;

use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\Filesystem\Filesystem;

trait CopiesToBuildDirectory
{
    abstract protected function buildPath(): string;

    protected function copyToBuildDirectory()
    {
        intro('Copying App to build directory...');

        $sourcePath = base_path();
        $buildPath = $this->buildPath();
        $filesystem = new Filesystem();

        // Clean and create build directory
        $filesystem->remove($buildPath);
        $filesystem->mkdir($buildPath);

        // Configure finder
        $finder = new Finder();
        $patterns = config('nativephp.cleanup_exclude_files') + static::CLEANUP_PATTERNS;

        $finder
            ->in($sourcePath)
            ->exclude(['vendor/bin', 'node_modules']) // Common exclusions - TODO: move to config
            ->ignoreDotFiles(false)
            ->followLinks(false)
            ->exclude($patterns) // Exclude directories
            ->filter(function (SplFileInfo $file) use ($patterns, $sourcePath) {
                // Filter out glob patterns
                $relativePath = substr($file->getPathname(), strlen($sourcePath) + 1);

                foreach ($patterns as $pattern) {
                    if (fnmatch($pattern, $relativePath)) {
                        return false;
                    }
                }
                return true;
            });

        // Copy files to build directory
        foreach ($finder as $file) {
            $relativePath = $file->getRelativePathname();
            $targetPath = $buildPath . DIRECTORY_SEPARATOR . $relativePath;

            if ($file->isDir()) {
                $filesystem->mkdir($targetPath);
            } else {
                $filesystem->copy($file->getRealPath(), $targetPath);
            }
        }

        $this->keepRequiredDirectories();

        note('App copied');
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
