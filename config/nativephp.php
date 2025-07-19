<?php

return [
    'hot_reload' => [
        base_path('app/Providers/NativeAppServiceProvider.php'),
    ],

    /**
     * Custom JavaScript scripts to execute during Electron initialization.
     * These scripts run after state setup but before app.whenReady().
     */
    'electron_init_scripts' => [
        // Examples of custom initialization scripts
        // 'const { initializeModule } = require("my-electron-module"); initializeModule();',
        // 'const customSetup = require("another-package"); customSetup.configure({option: true});',
        // 'console.log("Custom Electron initialization complete");',
    ],
];
