import os from 'os';
import path, { join } from 'path';
import {existsSync, mkdtempSync} from 'fs';

// Workaround for CommonJS module
import fs_extra from 'fs-extra';
const { copySync, removeSync, writeJsonSync, mkdirpSync } = fs_extra;

const isBuilding = process.env.NATIVEPHP_BUILDING;
const appId = process.env.NATIVEPHP_APP_ID;
const appName = process.env.NATIVEPHP_APP_NAME;
const fileName = process.env.NATIVEPHP_APP_FILENAME;
const appVersion = process.env.NATIVEPHP_APP_VERSION;
const appUrl = process.env.APP_URL;
const appAuthor = process.env.NATIVEPHP_APP_AUTHOR;
const deepLinkProtocol = process.env.NATIVEPHP_DEEPLINK_SCHEME;

// Since we do not copy the php executable here, we only need these for building
const isWindows = process.argv.includes('--win');
const isLinux = process.argv.includes('--linux');
const isDarwin = process.argv.includes('--mac');

let targetOs;

if (isWindows) {
    targetOs = 'win';
}
if (isLinux) {
    targetOs = 'linux';
}
// Use of isDarwin
if (isDarwin) {
    targetOs = 'mac';
}

let updaterConfig = {};

try {
    updaterConfig = process.env.NATIVEPHP_UPDATER_CONFIG;
    updaterConfig = JSON.parse(updaterConfig);
} catch (e) {
    updaterConfig = {};
}

if (isBuilding) {
    console.log("Current platform: ", process.platform)
    console.log("Current arch: ", process.arch)

    console.log();
    console.log('===================================================================');
    console.log('                    Building for ' + targetOs);
    console.log('===================================================================');
    console.log();
    console.log('Updater config', updaterConfig);
    console.log();

    try {
        const appPath = join(import.meta.dirname, 'resources', 'app');

        removeSync(appPath);

        let bundle = join(process.env.APP_PATH, 'build', '__nativephp_app_bundle');

        if (existsSync(bundle)) {
            copySync(bundle, join(appPath, 'bundle', '__nativephp_app_bundle'));
        } else {
            // As we can't copy into a subdirectory of ourself we need to copy to a temp directory
            let tmpDir = mkdtempSync(join(os.tmpdir(), 'nativephp'));

            console.warn('===================================================================');
            console.warn('                    * * * INSECURE BUILD * * *');
            console.warn('===================================================================');
            console.warn('Secure app bundle not found! Building with exposed source files.');
            console.warn('See https://nativephp.com/docs/publishing/building#security');
            console.warn('===================================================================');

            console.log('Copying app to temporary directory for build');
            copySync(process.env.APP_PATH, tmpDir, {
                overwrite: true,
                dereference: true,
                filter: (src) => {
                    let skip = [
                        // Skip .git and Dev directories
                        join(process.env.APP_PATH, '.git'),
                        join(process.env.APP_PATH, 'docker'),
                        join(process.env.APP_PATH, 'packages'),

                        // Only needed for local testing
                        join(process.env.APP_PATH, 'vendor', 'nativephp', 'electron', 'vendor'),
                        join(process.env.APP_PATH, 'vendor', 'nativephp', 'laravel', 'vendor'),

                        join(process.env.APP_PATH, 'vendor', 'nativephp', 'php-bin'),
                        join(process.env.APP_PATH, 'vendor', 'nativephp', 'electron', 'bin'),
                        join(process.env.APP_PATH, 'vendor', 'nativephp', 'electron', 'resources'),
                        join(process.env.APP_PATH, 'node_modules'),
                        join(process.env.APP_PATH, 'dist'),
                        join(process.env.APP_PATH, 'build'),

                        join(process.env.APP_PATH, 'storage', 'framework'),
                        join(process.env.APP_PATH, 'storage', 'logs'),
                    ];

                    let shouldSkip = false;
                    skip.forEach((path) => {
                        if (src.indexOf(path) === 0) {
                            shouldSkip = true;
                        }
                    });

                    return !shouldSkip;
                }
            });

            copySync(tmpDir, appPath);

            console.log('Preparing directories for electron build');
            // Electron build removes empty folders, so we have to create dummy files
            // dotfiles unfortunately don't work.
            const emptyPaths = [
                join(appPath, 'storage', 'framework', 'cache', '_native.json'),
                join(appPath, 'storage', 'framework', 'sessions', '_native.json'),
                join(appPath, 'storage', 'framework', 'testing', '_native.json'),
                join(appPath, 'storage', 'framework', 'views', '_native.json'),
                join(appPath, 'storage', 'app', 'public', '_native.json'),
                join(appPath, 'storage', 'logs', '_native.json'),
            ];

            emptyPaths.forEach((emptyPath) => {
                // Create directory if it doesn't exist
                let dir =  path.dirname(emptyPath);
                if (!existsSync(dir)) {
                    mkdirpSync(dir);
                }

                writeJsonSync(emptyPath, {});
            });

            removeSync(tmpDir);
        }

        console.log();
        console.log('Copied app to resources');
        console.log(join(process.env.APP_PATH, 'dist'));
        console.log();
        console.log('===================================================================');
        console.log('                       Starting build...');
        console.log('===================================================================');
        console.log();
    } catch (e) {
        console.error();
        console.error('Error copying app into build environment');
        console.error(e);
        console.error();
    }

}

export default {
    appId: appId,
    productName: appName,
    directories: {
        buildResources: 'build',
        output: isBuilding ? join(process.env.APP_PATH, 'dist') : undefined,
    },
    files: [
        '!**/.vscode/*',
        '!src/*',
        '!electron.vite.config.{js,ts,mjs,cjs}',
        '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}',
        '!{.env,.env.*,.npmrc,pnpm-lock.yaml}',
    ],
    asarUnpack: [
        'resources/**',
    ],
    afterSign: 'build/notarize.js',
    win: {
        executableName: fileName,
    },
    nsis: {
        artifactName: appName + '-${version}-setup.${ext}',
        shortcutName: '${productName}',
        uninstallDisplayName: '${productName}',
        createDesktopShortcut: 'always',
    },
    protocols: {
        name: deepLinkProtocol,
        schemes: [deepLinkProtocol],
    },
    mac: {
        entitlementsInherit: 'build/entitlements.mac.plist',
        artifactName: appName + '-${version}-${arch}.${ext}',
        extendInfo: {
            NSCameraUsageDescription:
                "Application requests access to the device's camera.",
            NSMicrophoneUsageDescription:
                "Application requests access to the device's microphone.",
            NSDocumentsFolderUsageDescription:
                "Application requests access to the user's Documents folder.",
            NSDownloadsFolderUsageDescription:
                "Application requests access to the user's Downloads folder.",
        },
    },
    dmg: {
        artifactName: appName + '-${version}-${arch}.${ext}',
    },
    linux: {
        target: ['AppImage', 'deb'],
        maintainer: appUrl,
        category: 'Utility',
    },
    appImage: {
        artifactName: appName + '-${version}.${ext}',
    },
    npmRebuild: false,
    publish: updaterConfig,
    extraMetadata: {
        name: fileName,
        homepage: appUrl,
        version: appVersion,
        author: appAuthor,
    }
};
