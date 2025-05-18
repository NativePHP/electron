<?php

namespace Native\Electron\Tests\Unit\Traits;

use Native\Electron\Traits\PublishesElectronBuilderJs;

beforeEach(function () {
    // Set up
    app()->setBasePath(realpath(__DIR__.'/../../../'));

    // Copy the original package.json file to a backup
    $packageJsonPath = base_path('resources/js/package.json');
    $originalPackageJsonPath = base_path('resources/js/package.json.original');

    // Create a backup of the file
    copy($packageJsonPath, $originalPackageJsonPath);
});

afterEach(function () {
    // Clean up after test
    $publishPath = base_path('resources/vendor/nativephp/js/electron-builder.js');

    // Remove the backup file
    if (file_exists($publishPath)) {
        unlink($publishPath);
    }

    // Restore the original package.json file
    $packageJsonPath = base_path('resources/js/package.json');
    $originalPackageJsonPath = base_path('resources/js/package.json.original');

    // Restore the original file
    if (file_exists($originalPackageJsonPath)) {
        copy($originalPackageJsonPath, $packageJsonPath);

        // Remove the original copy
        unlink($originalPackageJsonPath);
    }

    // Remove package.json.bck
    $packageJsonBckPath = base_path('resources/js/package.json.bck');
    if (file_exists($packageJsonBckPath)) {
        unlink($packageJsonBckPath);
    }
});

it('can publish a copy of the electron-builder.js to the destination folder and update the package.json', function (object $mock) {
    $mock->publishElectronBuilderJs();

    $publishPath = base_path('resources/vendor/nativephp/js/electron-builder.js');

    expect(file_exists($publishPath))->toBeTrue()
        ->and(file_get_contents($publishPath))->not->toBe('')
        ->and(file_get_contents($publishPath))->toBe(file_get_contents(base_path('resources/js/electron-builder.js')));

    // Check if the package.json file has been updated
    $packageJsonPath = base_path('resources/js/package.json');
    $packageJson = json_decode(file_get_contents($packageJsonPath), true);
    $publishPath = base_path('resources/vendor/nativephp/js/electron-builder.js');

    // Check if the publish path is in the package.json
    expect($packageJson['scripts']['build:win-x64'])->toContain('--config '.$publishPath)
        ->and($packageJson['scripts']['build:mac-arm64'])->toContain('--config '.$publishPath)
        ->and($packageJson['scripts']['build:mac-x86'])->toContain('--config '.$publishPath)
        ->and($packageJson['scripts']['build:linux-x64'])->toContain('--config '.$publishPath);
})
    ->with([
        // Empty class with the MergesElectronConfig trait
        new class
        {
            use PublishesElectronBuilderJs;
        },
    ]);

it('can restore the original package state', function (object $mock) {
    // Create a backup of the original package.json file
    $packageJsonPath = base_path('resources/js/package.json');
    $packageJsonContents = file_get_contents($packageJsonPath);

    // Publish the electron-builder.js file
    $mock->publishElectronBuilderJs(true);

    // Restore the original package.json file
    $mock->restoreElectronBuilderJs();

    // Check if the package.json file has been restored
    expect($packageJsonContents)->toBe(file_get_contents($packageJsonPath));
})
    ->with([
        // Empty class with the MergesElectronConfig trait
        new class
        {
            use PublishesElectronBuilderJs;
        },
    ]);
