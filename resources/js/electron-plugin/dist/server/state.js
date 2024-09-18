"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_store_1 = __importDefault(require("electron-store"));
const utils_1 = require("./utils");
const settingsStore = new electron_store_1.default();
settingsStore.onDidAnyChange((newValue, oldValue) => {
    const changedKey = Object.keys(newValue).find((key) => newValue[key] !== oldValue[key]);
    if (changedKey) {
        (0, utils_1.notifyLaravel)("events", {
            event: "Native\\Laravel\\Events\\Settings\\SettingChanged",
            payload: {
                key: changedKey,
                value: newValue[changedKey] || null,
            },
        });
    }
});
function generateRandomString(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.default = {
    electronApiPort: null,
    activeMenuBar: null,
    php: null,
    phpPort: null,
    phpIni: null,
    caCert: null,
    icon: null,
    store: settingsStore,
    randomSecret: generateRandomString(32),
    windows: {},
    findWindow(id) {
        return this.windows[id] || null;
    },
};
