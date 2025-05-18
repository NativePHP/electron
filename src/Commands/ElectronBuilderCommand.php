<?php

namespace Native\Electron\Commands;

use Illuminate\Console\Command;
use Native\Electron\Traits\PublishesElectronBuilderJs;

class ElectronBuilderCommand extends Command
{
    use PublishesElectronBuilderJs;

    protected $signature = 'nativephp:electron-builder {--force} {--restore}';

    public function handle(): void
    {
        if ($this->option('restore')) {
            // Restore the electron-builder.js file
            $this->restoreElectronBuilderJs();

            return;
        }

        // Publish the electron-builder.js file
        $this->publishElectronBuilderJs($this->option('force'));
    }
}
