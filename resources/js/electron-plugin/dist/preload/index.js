"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const remote = __importStar(require("@electron/remote"));
const native_1 = __importDefault(require("./native"));
window.Native = native_1.default;
window.remote = remote;
electron_1.ipcRenderer.on('log', (event, { level, message, context }) => {
    if (level === 'error') {
        console.error(`[${level}] ${message}`, context);
    }
    else if (level === 'warn') {
        console.warn(`[${level}] ${message}`, context);
    }
    else {
        console.log(`[${level}] ${message}`, context);
    }
});
electron_1.ipcRenderer.on('native-event', (event, data) => {
    if (window.Livewire) {
        window.Livewire.dispatch('native:' + data.event, data.payload);
    }
    if (window.livewire) {
        window.livewire.components.components().forEach(component => {
            if (Array.isArray(component.listeners)) {
                component.listeners.forEach(event => {
                    if (event.startsWith('native')) {
                        let event_parts = event.split(/(native:|native-)|:|,/);
                        if (event_parts[1] == 'native:') {
                            event_parts.splice(2, 0, 'private', undefined, 'nativephp', undefined);
                        }
                        let [s1, signature, channel_type, s2, channel, s3, event_name,] = event_parts;
                        if (data.event === event_name) {
                            window.livewire.emit(event, data.payload);
                        }
                    }
                });
            }
        });
    }
});
