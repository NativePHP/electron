<?php

namespace Native\Electron\Traits;

use Symfony\Component\Filesystem\Path;
use function Laravel\Prompts\error;
use function Laravel\Prompts\intro;

trait CopiesCertificateAuthority
{
    protected function copyCertificateAuthorityCertificate(): void
    {
        try {
            intro('Copying latest CA Certificate...');

            $copied = copy(
                Path::join($this->sourcePath(), 'vendor', 'nativephp', 'php-bin', 'cacert.pem'),
                Path::join($this->sourcePath(), 'vendor', 'nativephp', 'electron', 'resources', 'js', 'resources', 'cacert.pem')
            );

            if (!$copied) {
                // It returned false, but doesn't give a reason why.
                throw new \Exception('copy() failed for an unknown reason.');
            }
        } catch (\Throwable $e) {
            error('Failed to copy CA Certificate: '.$e->getMessage());
        }
    }
}
