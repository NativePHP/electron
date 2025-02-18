<?php

namespace Native\Electron\Tests\Unit\Traits;

use Illuminate\Support\Facades\Config;
use Native\Electron\Tests\Mocks\HasPreAndPostProcessingMock;

it('can run pre and post processing from config', function () {
    $tmpDir = sys_get_temp_dir();

    Config::set('nativephp.prebuild', [
        'touch '.$tmpDir.'/prebuild1',
        'touch '.$tmpDir.'/prebuild2',
    ]);

    Config::set('nativephp.postbuild', [
        'touch '.$tmpDir.'/postbuild1',
        'touch '.$tmpDir.'/postbuild2',
    ]);

    $mock = \Mockery::mock(HasPreAndPostProcessingMock::class)
        ->makePartial();

    $mock->shouldAllowMockingProtectedMethods();
    $mock->shouldReceive('getPrePostBuildConfig')
        ->with('prebuild')
        ->andReturn(collect(Config::get('nativephp.prebuild')));

    $mock->shouldReceive('getPrePostBuildConfig')
        ->with('postbuild')
        ->andReturn(collect(Config::get('nativephp.postbuild')));

    // Verify those files were created in preProcess
    $mock->preProcess();

    expect(file_exists($tmpDir.'/prebuild1'))->toBeTrue();
    expect(file_exists($tmpDir.'/prebuild2'))->toBeTrue();

    // Verify those files were created in postProcess
    $mock->postProcess();
    expect(file_exists($tmpDir.'/postbuild1'))->toBeTrue();
    expect(file_exists($tmpDir.'/postbuild2'))->toBeTrue();

    // Cleanup
    unlink($tmpDir.'/prebuild1');
    unlink($tmpDir.'/prebuild2');
    unlink($tmpDir.'/postbuild1');
    unlink($tmpDir.'/postbuild2');
});
