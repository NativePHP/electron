<?php

namespace Native\Electron\Tests\Mocks;

use Illuminate\Console\Command;
use Native\Electron\Traits\HasPreAndPostProcessing;

#[\AllowDynamicProperties]
class HasPreAndPostProcessingMock extends Command
{
    use HasPreAndPostProcessing;
}
