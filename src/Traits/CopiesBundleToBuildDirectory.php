<?php

namespace Native\Electron\Traits;

use Symfony\Component\Filesystem\Filesystem;

use function Laravel\Prompts\warning;

trait CopiesBundleToBuildDirectory
{
    use CopiesToBuildDirectory;

    protected static string $bundlePath = 'build/__nativephp_app_bundle';

    protected function hasBundled(): bool
    {
        return (new Filesystem)->exists($this->sourcePath(self::$bundlePath));
    }

    public function copyBundleToBuildDirectory(): bool
    {
        if ($this->hasBundled()) {

            $this->line('Copying secure app bundle to build directory...');
            $this->line('From: '.realpath(dirname($this->sourcePath(self::$bundlePath))));
            $this->line('To: '.realpath(dirname($this->buildPath(self::$bundlePath))));

            (new Filesystem)->copy(
                $this->sourcePath(self::$bundlePath),
                $this->buildPath(self::$bundlePath),
            );

            return true;
        }

        $this->warnUnsecureBuild();

        return $this->copyToBuildDirectory();
    }

    public function warnUnsecureBuild(): void
    {
        warning('===================================================================');
        warning('                    * * * INSECURE BUILD * * *');
        warning('===================================================================');
        warning('Secure app bundle not found! Building with exposed source files.');
        warning('See https://nativephp.com/docs/publishing/building#security');
        warning('===================================================================');
    }
}
