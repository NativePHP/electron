"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrievePhpIniSettings = exports.retrieveNativePHPConfig = exports.getAppPath = exports.serveApp = exports.startScheduler = exports.startQueueWorker = void 0;
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const electron_store_1 = __importDefault(require("electron-store"));
const util_1 = require("util");
const path_1 = require("path");
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const state_1 = __importDefault(require("./state"));
const get_port_1 = __importDefault(require("get-port"));
const storagePath = (0, path_1.join)(electron_1.app.getPath('userData'), 'storage');
const databasePath = (0, path_1.join)(electron_1.app.getPath('userData'), 'database');
const databaseFile = (0, path_1.join)(databasePath, 'database.sqlite');
const argumentEnv = getArgumentEnv();
const appPath = getAppPath();
function getPhpPort() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, get_port_1.default)({
            host: '127.0.0.1',
            port: get_port_1.default.makeRange(8100, 9000)
        });
    });
}
function retrievePhpIniSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        const env = {
            NATIVEPHP_RUNNING: 'true',
            NATIVEPHP_STORAGE_PATH: storagePath,
            NATIVEPHP_DATABASE_PATH: databaseFile,
        };
        const phpOptions = {
            cwd: appPath,
            env
        };
        return yield (0, util_1.promisify)(child_process_1.execFile)(state_1.default.php, ['artisan', 'native:php-ini'], phpOptions);
    });
}
exports.retrievePhpIniSettings = retrievePhpIniSettings;
function retrieveNativePHPConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const env = {
            NATIVEPHP_RUNNING: 'true',
            NATIVEPHP_STORAGE_PATH: storagePath,
            NATIVEPHP_DATABASE_PATH: databaseFile,
        };
        const phpOptions = {
            cwd: appPath,
            env
        };
        return yield (0, util_1.promisify)(child_process_1.execFile)(state_1.default.php, ['artisan', 'native:config'], phpOptions);
    });
}
exports.retrieveNativePHPConfig = retrieveNativePHPConfig;
function callPhp(args, options, phpIniSettings = {}) {
    let defaultIniSettings = {
        'memory_limit': '512M',
        'curl.cainfo': state_1.default.caCert,
        'openssl.cafile': state_1.default.caCert
    };
    let iniSettings = Object.assign(defaultIniSettings, phpIniSettings);
    Object.keys(iniSettings).forEach(key => {
        args.unshift('-d', `${key}=${iniSettings[key]}`);
    });
    return (0, child_process_1.spawn)(state_1.default.php, args, {
        cwd: options.cwd,
        env: Object.assign(Object.assign({}, process.env), options.env),
    });
}
function getArgumentEnv() {
    const envArgs = process.argv.filter(arg => arg.startsWith('--env.'));
    const env = {};
    envArgs.forEach(arg => {
        const [key, value] = arg.slice(6).split('=');
        env[key] = value;
    });
    return env;
}
function getAppPath() {
    let appPath = (0, path_1.join)(__dirname, '../../../../../resources/app/').replace('app.asar', 'app.asar.unpacked');
    if (process.env.NODE_ENV === 'development' || argumentEnv.TESTING == 1) {
        appPath = process.env.APP_PATH || argumentEnv.APP_PATH;
    }
    return appPath;
}
exports.getAppPath = getAppPath;
function ensureAppFoldersAreAvailable() {
    if (!(0, fs_1.existsSync)(storagePath) || process.env.NODE_ENV === 'development') {
        (0, fs_extra_1.copySync)((0, path_1.join)(appPath, 'storage'), storagePath);
    }
    (0, fs_1.mkdirSync)(databasePath, { recursive: true });
    try {
        (0, fs_1.statSync)(databaseFile);
    }
    catch (error) {
        (0, fs_1.writeFileSync)(databaseFile, '');
    }
}
function startQueueWorker(secret, apiPort, phpIniSettings = {}) {
    const env = {
        APP_ENV: process.env.NODE_ENV === 'development' ? 'local' : 'production',
        APP_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false',
        NATIVEPHP_STORAGE_PATH: storagePath,
        NATIVEPHP_DATABASE_PATH: databaseFile,
        NATIVEPHP_API_URL: `http://localhost:${apiPort}/api/`,
        NATIVEPHP_RUNNING: true,
        NATIVEPHP_SECRET: secret
    };
    const phpOptions = {
        cwd: appPath,
        env
    };
    return callPhp(['artisan', 'queue:work'], phpOptions, phpIniSettings);
}
exports.startQueueWorker = startQueueWorker;
function startScheduler(secret, apiPort, phpIniSettings = {}) {
    const env = getDefaultEnvironmentVariables(secret, apiPort);
    const phpOptions = {
        cwd: appPath,
        env
    };
    return callPhp(['artisan', 'schedule:run'], phpOptions, phpIniSettings);
}
exports.startScheduler = startScheduler;
function getPath(name) {
    try {
        return electron_1.app.getPath(name);
    }
    catch (error) {
        return '';
    }
}
function getDefaultEnvironmentVariables(secret, apiPort) {
    return {
        APP_ENV: process.env.NODE_ENV === 'development' ? 'local' : 'production',
        APP_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false',
        NATIVEPHP_STORAGE_PATH: storagePath,
        NATIVEPHP_DATABASE_PATH: databaseFile,
        NATIVEPHP_API_URL: `http://localhost:${apiPort}/api/`,
        NATIVEPHP_RUNNING: true,
        NATIVEPHP_SECRET: secret,
        NATIVEPHP_USER_HOME_PATH: getPath('home'),
        NATIVEPHP_APP_DATA_PATH: getPath('appData'),
        NATIVEPHP_USER_DATA_PATH: getPath('userData'),
        NATIVEPHP_DESKTOP_PATH: getPath('desktop'),
        NATIVEPHP_DOCUMENTS_PATH: getPath('documents'),
        NATIVEPHP_DOWNLOADS_PATH: getPath('downloads'),
        NATIVEPHP_MUSIC_PATH: getPath('music'),
        NATIVEPHP_PICTURES_PATH: getPath('pictures'),
        NATIVEPHP_VIDEOS_PATH: getPath('videos'),
        NATIVEPHP_RECENT_PATH: getPath('recent'),
    };
}
function serveApp(secret, apiPort, phpIniSettings) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const appPath = getAppPath();
        console.log('Starting PHP server...', `${state_1.default.php} artisan serve`, appPath, phpIniSettings);
        ensureAppFoldersAreAvailable();
        console.log('Making sure app folders are available');
        const env = getDefaultEnvironmentVariables(secret, apiPort);
        const phpOptions = {
            cwd: appPath,
            env
        };
        const store = new electron_store_1.default();
        callPhp(['artisan', 'storage:link', '--force'], phpOptions, phpIniSettings);
        if (store.get('migrated_version') !== electron_1.app.getVersion() && process.env.NODE_ENV !== 'development') {
            console.log('Migrating database...');
            callPhp(['artisan', 'migrate', '--force'], phpOptions, phpIniSettings);
            store.set('migrated_version', electron_1.app.getVersion());
        }
        if (process.env.NODE_ENV === 'development') {
            console.log('Skipping Database migration while in development.');
            console.log('You may migrate manually by running: php artisan native:migrate');
        }
        const phpPort = yield getPhpPort();
        const serverPath = (0, path_1.join)(appPath, 'vendor', 'laravel', 'framework', 'src', 'Illuminate', 'Foundation', 'resources', 'server.php');
        const phpServer = callPhp(['-S', `127.0.0.1:${phpPort}`, serverPath], {
            cwd: (0, path_1.join)(appPath, 'public'),
            env
        }, phpIniSettings);
        const portRegex = /Development Server \(.*:([0-9]+)\) started/gm;
        phpServer.stdout.on('data', (data) => {
            const match = portRegex.exec(data.toString());
            if (match) {
                console.log("PHP Server started on port: ", match[1]);
                const port = parseInt(match[1]);
                resolve({
                    port,
                    process: phpServer
                });
            }
        });
        phpServer.stderr.on('data', (data) => {
            const match = portRegex.exec(data.toString());
            if (match) {
                const port = parseInt(match[1]);
                console.log("PHP Server started on port: ", port);
                resolve({
                    port,
                    process: phpServer
                });
            }
        });
        phpServer.on('error', (error) => {
            reject(error);
        });
    }));
}
exports.serveApp = serveApp;
