<?php

namespace Native\Electron\Traits;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;

trait PublishesElectronBuilderJs
{
    /**
     * Publishes the electron-builder.js to the resources directory
     * of the application.
     *
     * @see /resources/js/electron-builder.js
     */
    public function publishElectronBuilderJs(bool $force = false): void
    {
        intro('Publishing electron-builder.js to vendor folder ...');

        // Destination path
        $destinationPath = base_path('resources/vendor/nativephp/js/electron-builder.js');

        if (file_exists($destinationPath) && ! $force) {
            note('The file already exists. Use --force to overwrite.');

            // If the file already exists we want to keep the backup
            return;
        }

        // Path to src
        $electronBuilderPath = __DIR__.'/../../resources/js/electron-builder.js';

        // Create the destination directory if it does not exist
        if (! file_exists(dirname($destinationPath))) {
            mkdir(dirname($destinationPath), 0755, true);
        }

        // Copy the file to the destination
        if (! copy($electronBuilderPath, $destinationPath)) {
            throw new \Exception('Failed to publish the electron-builder.js to the resource directory file.');
        }

        // Updating package.json
        note('Updating package.json ...');
        $packageJsonPath = __DIR__.'/../../resources/js/package.json';

        $packageJson = json_decode(file_get_contents($packageJsonPath), true);

        // Iterate over the scripts and add the publish path after '--conf'
        foreach ($packageJson['scripts'] as $key => $value) {
            if (str_contains($value, '--config')) {
                // Add the publish path to the script
                $packageJson['scripts'][$key] = str_replace(
                    '--config',
                    "--config $destinationPath ",
                    $value
                );
            }
        }

        // Create a backup of the original package.json if not exists
        $originalPackageJsonPath = __DIR__.'/../../resources/js/package.json.bck';
        if (! file_exists($originalPackageJsonPath)) {
            copy($packageJsonPath, $originalPackageJsonPath);
        }

        // Save the updated package.json
        file_put_contents($packageJsonPath, json_encode($packageJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    /**
     * Restore the build configuration to the original state.
     *
     * @see /resources/js/electron-builder.js
     */
    public function restoreElectronBuilderJs(): void
    {
        intro('Restoring default electron build configuration...');

        // Get the backup path
        $originalPackageJsonPath = __DIR__.'/../../resources/js/package.json.bck';

        if (! file_exists($originalPackageJsonPath)) {
            throw new \Exception('The original package.json file does not exist.');
        }

        // Restore the original package.json file
        $packageJsonPath = __DIR__.'/../../resources/js/package.json';
        if (! copy($originalPackageJsonPath, $packageJsonPath)) {
            throw new \Exception('Failed to restore the original package.json file.');
        }

        // Remove the backup file
        if (file_exists($originalPackageJsonPath)) {
            unlink($originalPackageJsonPath);
        }
    }
}
