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
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const state_1 = __importDefault(require("./server/state"));
const utils_1 = require("@electron-toolkit/utils");
const server_1 = require("./server");
const utils_2 = require("./server/utils");
const path_1 = require("path");
const ps_node_1 = __importDefault(require("ps-node"));
class NativePHP {
    constructor() {
        this.processes = [];
        this.schedulerInterval = undefined;
    }
    bootstrap(app, icon, phpBinary, cert) {
        require("@electron/remote/main").initialize();
        state_1.default.icon = icon;
        state_1.default.php = phpBinary;
        state_1.default.caCert = cert;
        this.bootstrapApp(app);
        this.addEventListeners(app);
    }
    addEventListeners(app) {
        app.on("open-url", (event, url) => {
            (0, utils_2.notifyLaravel)("events", {
                event: "\\Native\\Laravel\\Events\\App\\OpenedFromURL",
                payload: [url],
            });
        });
        app.on("open-file", (event, path) => {
            (0, utils_2.notifyLaravel)("events", {
                event: "\\Native\\Laravel\\Events\\App\\OpenFile",
                payload: [path],
            });
        });
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
        app.on("before-quit", () => {
            if (this.schedulerInterval) {
                clearInterval(this.schedulerInterval);
            }
            this.killChildProcesses();
        });
        app.on("browser-window-created", (_, window) => {
            utils_1.optimizer.watchWindowShortcuts(window);
        });
        app.on("activate", function (event, hasVisibleWindows) {
            if (!hasVisibleWindows) {
                (0, utils_2.notifyLaravel)("booted");
            }
            event.preventDefault();
        });
    }
    bootstrapApp(app) {
        return __awaiter(this, void 0, void 0, function* () {
            yield app.whenReady();
            const config = yield this.loadConfig();
            this.setDockIcon();
            this.setAppUserModelId(config);
            this.setDeepLinkHandler(config);
            this.startAutoUpdater(config);
            yield this.startElectronApi();
            state_1.default.phpIni = yield this.loadPhpIni();
            yield this.startPhpApp();
            yield this.startQueueWorker();
            yield this.startWebsockets();
            this.startScheduler();
            yield (0, utils_2.notifyLaravel)("booted");
        });
    }
    loadConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            let config = {};
            try {
                const result = yield (0, server_1.retrieveNativePHPConfig)();
                config = JSON.parse(result.stdout);
            }
            catch (error) {
                console.error(error);
            }
            return config;
        });
    }
    setDockIcon() {
        if (process.platform === "darwin" &&
            process.env.NODE_ENV === "development") {
            electron_1.app.dock.setIcon(state_1.default.icon);
        }
    }
    setAppUserModelId(config) {
        utils_1.electronApp.setAppUserModelId(config === null || config === void 0 ? void 0 : config.app_id);
    }
    setDeepLinkHandler(config) {
        const deepLinkProtocol = config === null || config === void 0 ? void 0 : config.deeplink_scheme;
        if (deepLinkProtocol) {
            if (process.defaultApp) {
                if (process.argv.length >= 2) {
                    electron_1.app.setAsDefaultProtocolClient(deepLinkProtocol, process.execPath, [
                        (0, path_1.resolve)(process.argv[1]),
                    ]);
                }
            }
            else {
                electron_1.app.setAsDefaultProtocolClient(deepLinkProtocol);
            }
        }
    }
    startAutoUpdater(config) {
        var _a;
        if (((_a = config === null || config === void 0 ? void 0 : config.updater) === null || _a === void 0 ? void 0 : _a.enabled) === true) {
            electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        }
    }
    startElectronApi() {
        return __awaiter(this, void 0, void 0, function* () {
            const electronApi = yield (0, server_1.startAPI)();
            state_1.default.electronApiPort = electronApi.port;
            console.log("Electron API server started on port", electronApi.port);
        });
    }
    loadPhpIni() {
        return __awaiter(this, void 0, void 0, function* () {
            let config = {};
            try {
                const result = yield (0, server_1.retrievePhpIniSettings)();
                config = JSON.parse(result.stdout);
            }
            catch (error) {
                console.error(error);
            }
            return config;
        });
    }
    startPhpApp() {
        return __awaiter(this, void 0, void 0, function* () {
            this.processes.push(yield (0, server_1.startPhpApp)());
        });
    }
    startQueueWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            this.processes.push(yield (0, server_1.startQueue)());
        });
    }
    startWebsockets() {
        return __awaiter(this, void 0, void 0, function* () {
            this.processes.push(yield (0, server_1.startWebsockets)());
        });
    }
    startScheduler() {
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000 + (1000 - now.getMilliseconds());
        setTimeout(() => {
            console.log("Running scheduler...");
            (0, server_1.runScheduler)();
            this.schedulerInterval = setInterval(() => {
                console.log("Running scheduler...");
                (0, server_1.runScheduler)();
            }, 60 * 1000);
        }, delay);
    }
    killChildProcesses() {
        this.processes
            .filter((p) => p !== undefined)
            .forEach((process) => {
            try {
                ps_node_1.default.kill(process.pid);
            }
            catch (err) {
                console.error(err);
            }
        });
    }
}
module.exports = new NativePHP();
