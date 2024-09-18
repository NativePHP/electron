"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const state_1 = __importDefault(require("../state"));
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.post('/open', (req, res) => {
    const { title, buttonLabel, filters, properties, defaultPath, message, windowReference } = req.body;
    let options = {
        title,
        defaultPath,
        buttonLabel,
        filters,
        message,
        properties
    };
    options = (0, utils_1.trimOptions)(options);
    let result;
    let browserWindow = state_1.default.findWindow(windowReference);
    if (browserWindow) {
        result = electron_1.dialog.showOpenDialogSync(browserWindow, options);
    }
    else {
        result = electron_1.dialog.showOpenDialogSync(options);
    }
    res.json({
        result
    });
});
router.post('/save', (req, res) => {
    const { title, buttonLabel, filters, properties, defaultPath, message, windowReference } = req.body;
    let options = {
        title,
        defaultPath,
        buttonLabel,
        filters,
        message,
        properties
    };
    options = (0, utils_1.trimOptions)(options);
    let result;
    let browserWindow = state_1.default.findWindow(windowReference);
    if (browserWindow) {
        result = electron_1.dialog.showSaveDialogSync(browserWindow, options);
    }
    else {
        result = electron_1.dialog.showSaveDialogSync(options);
    }
    res.json({
        result
    });
});
router.post('/message', (req, res) => {
    const { title, message, type, buttons } = req.body;
    const result = electron_1.dialog.showMessageBoxSync({
        title,
        message,
        type,
        buttons
    });
    res.json({
        result
    });
});
router.post('/error', (req, res) => {
    const { title, message } = req.body;
    electron_1.dialog.showErrorBox(title, message);
    res.json({
        result: true
    });
});
exports.default = router;
