<?php

namespace Native\Electron\Commands;

use Illuminate\Console\Command;
use function Laravel\Prompts\error;
use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;

class IconCommand extends Command
{
    protected $signature = 'native:icon {path=resources/icon.png : The path to your application\'s icon}';

    protected $description = 'A command to set your app icon. By default, it will look for `resources/icon.png`.
        Make sure your icon is at least 1024px x 1024px';

    public function handle()
    {
        if (! file_exists($path = $this->argument('path'))) {
            error("No icon file exists at `{$path}`");

            return Command::INVALID;
        }

        intro('Copying app icon...');

        @copy($path, __DIR__.'/../../resources/js/resources/icon.png');

        note('App icon copied');

        return Command::SUCCESS;
    }
}
