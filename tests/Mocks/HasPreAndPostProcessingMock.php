<?php

namespace Native\Electron\Tests\Mocks;

use Illuminate\Console\Command;
use Native\Electron\Traits\HasPreAndPostProcessing;

class HasPreAndPostProcessingMock extends Command
{
    use HasPreAndPostProcessing;
}
