"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
const php_1 = require("./php");
const state_1 = __importDefault(require("./state"));
function startWebsockets() {
    if (!(0, fs_1.existsSync)((0, path_1.join)((0, php_1.getAppPath)(), "vendor", "beyondcode", "laravel-websockets"))) {
        return;
    }
    const phpServer = (0, child_process_1.spawn)(state_1.default.php, ["artisan", "websockets:serve"], {
        cwd: (0, php_1.getAppPath)(),
    });
    phpServer.stdout.on("data", (data) => { });
    phpServer.stderr.on("data", (data) => { });
    return phpServer;
}
exports.default = startWebsockets;
