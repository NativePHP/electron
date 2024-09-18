"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
exports.default = {
    on: (event, callback) => {
        electron_1.ipcRenderer.on('native-event', (_, data) => {
            event = event.replace(/^(\\)+/, '');
            data.event = data.event.replace(/^(\\)+/, '');
            if (event === data.event) {
                return callback(data.payload, event);
            }
        });
    }
};
