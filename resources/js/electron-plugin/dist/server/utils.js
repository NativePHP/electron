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
exports.trimOptions = exports.broadcastToWindows = exports.notifyLaravel = exports.appendCookie = void 0;
const electron_1 = require("electron");
const state_1 = __importDefault(require("./state"));
const axios_1 = __importDefault(require("axios"));
function appendCookie() {
    return __awaiter(this, void 0, void 0, function* () {
        const cookie = {
            url: `http://localhost:${state_1.default.phpPort}`,
            name: "_php_native",
            value: state_1.default.randomSecret,
        };
        yield electron_1.session.defaultSession.cookies.set(cookie);
    });
}
exports.appendCookie = appendCookie;
function notifyLaravel(endpoint, payload = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield axios_1.default.post(`http://127.0.0.1:${state_1.default.phpPort}/_native/api/${endpoint}`, payload, {
                headers: {
                    "X-NativePHP-Secret": state_1.default.randomSecret,
                },
            });
        }
        catch (e) {
        }
        if (endpoint === 'events') {
            broadcastToWindows('native-event', payload);
        }
    });
}
exports.notifyLaravel = notifyLaravel;
function broadcastToWindows(event, payload) {
    var _a;
    Object.values(state_1.default.windows).forEach(window => {
        window.webContents.send(event, payload);
    });
    if ((_a = state_1.default.activeMenuBar) === null || _a === void 0 ? void 0 : _a.window) {
        state_1.default.activeMenuBar.window.webContents.send(event, payload);
    }
}
exports.broadcastToWindows = broadcastToWindows;
function trimOptions(options) {
    Object.keys(options).forEach(key => options[key] == null && delete options[key]);
    return options;
}
exports.trimOptions = trimOptions;
