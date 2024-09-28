"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const state_1 = __importDefault(require("../state"));
const path_1 = require("path");
const utils_1 = require("../utils");
const router = express_1.default.Router();
const electron_window_state_1 = __importDefault(require("electron-window-state"));
router.post('/maximize', (req, res) => {
    var _a;
    const { id } = req.body;
    (_a = state_1.default.windows[id]) === null || _a === void 0 ? void 0 : _a.maximize();
    res.sendStatus(200);
});
router.post('/minimize', (req, res) => {
    var _a;
    const { id } = req.body;
    (_a = state_1.default.windows[id]) === null || _a === void 0 ? void 0 : _a.minimize();
    res.sendStatus(200);
});
router.post('/resize', (req, res) => {
    var _a;
    const { id, width, height } = req.body;
    (_a = state_1.default.windows[id]) === null || _a === void 0 ? void 0 : _a.setSize(parseInt(width), parseInt(height));
    res.sendStatus(200);
});
router.post('/position', (req, res) => {
    var _a;
    const { id, x, y, animate } = req.body;
    (_a = state_1.default.windows[id]) === null || _a === void 0 ? void 0 : _a.setPosition(parseInt(x), parseInt(y), animate);
    res.sendStatus(200);
});
router.post('/reload', (req, res) => {
    var _a;
    const { id } = req.body;
    (_a = state_1.default.windows[id]) === null || _a === void 0 ? void 0 : _a.reload();
    res.sendStatus(200);
});
router.post('/close', (req, res) => {
    const { id } = req.body;
    if (state_1.default.windows[id]) {
        state_1.default.windows[id].close();
        delete state_1.default.windows[id];
    }
    return res.sendStatus(200);
});
router.post('/hide', (req, res) => {
    const { id } = req.body;
    if (state_1.default.windows[id]) {
        state_1.default.windows[id].hide();
    }
    return res.sendStatus(200);
});
router.get('/current', (req, res) => {
    const currentWindow = Object.values(state_1.default.windows).find(window => window.id === electron_1.BrowserWindow.getFocusedWindow().id);
    const id = Object.keys(state_1.default.windows).find(key => state_1.default.windows[key] === currentWindow);
    res.json({
        id: id,
        x: currentWindow.getPosition()[0],
        y: currentWindow.getPosition()[1],
        width: currentWindow.getSize()[0],
        height: currentWindow.getSize()[1],
        title: currentWindow.getTitle(),
        alwaysOnTop: currentWindow.isAlwaysOnTop(),
    });
});
router.post('/always-on-top', (req, res) => {
    var _a;
    const { id, alwaysOnTop } = req.body;
    (_a = state_1.default.windows[id]) === null || _a === void 0 ? void 0 : _a.setAlwaysOnTop(alwaysOnTop);
    res.sendStatus(200);
});
router.post('/open', (req, res) => {
    let { id, x, y, frame, width, height, minWidth, minHeight, maxWidth, maxHeight, focusable, hasShadow, url, resizable, movable, minimizable, maximizable, closable, title, alwaysOnTop, titleBarStyle, trafficLightPosition, vibrancy, backgroundColor, transparency, showDevTools, fullscreen, fullscreenable, kiosk, autoHideMenuBar, } = req.body;
    if (state_1.default.windows[id]) {
        state_1.default.windows[id].show();
        state_1.default.windows[id].focus();
        return res.sendStatus(200);
    }
    let preloadPath = (0, path_1.join)(__dirname, '../../preload/index.js');
    let windowState = undefined;
    if (req.body.rememberState === true) {
        windowState = (0, electron_window_state_1.default)({
            file: `window-state-${id}.json`,
            defaultHeight: parseInt(height),
            defaultWidth: parseInt(width),
        });
    }
    const window = new electron_1.BrowserWindow(Object.assign(Object.assign({ width: (windowState === null || windowState === void 0 ? void 0 : windowState.width) || parseInt(width), height: (windowState === null || windowState === void 0 ? void 0 : windowState.height) || parseInt(height), frame: frame !== undefined ? frame : true, x: (windowState === null || windowState === void 0 ? void 0 : windowState.x) || x, y: (windowState === null || windowState === void 0 ? void 0 : windowState.y) || y, minWidth: minWidth, minHeight: minHeight, maxWidth: maxWidth, maxHeight: maxHeight, show: false, title,
        backgroundColor, transparent: transparency, alwaysOnTop,
        resizable,
        movable,
        minimizable,
        maximizable,
        closable,
        hasShadow,
        titleBarStyle,
        trafficLightPosition,
        vibrancy,
        focusable,
        autoHideMenuBar }, (process.platform === 'linux' ? { icon: state_1.default.icon } : {})), { webPreferences: {
            backgroundThrottling: false,
            spellcheck: false,
            preload: preloadPath,
            sandbox: false,
            contextIsolation: false,
            nodeIntegration: true,
        }, fullscreen,
        fullscreenable,
        kiosk }));
    if ((process.env.NODE_ENV === 'development' || showDevTools === true) && showDevTools !== false) {
        window.webContents.openDevTools();
    }
    require("@electron/remote/main").enable(window.webContents);
    if (req.body.rememberState === true) {
        windowState.manage(window);
    }
    window.on('blur', () => {
        window.webContents.send('window:blur');
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowBlurred',
            payload: [id]
        });
    });
    window.on('focus', () => {
        window.webContents.send('window:focus');
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowFocused',
            payload: [id]
        });
    });
    window.on('minimize', () => {
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowMinimized',
            payload: [id]
        });
    });
    window.on('maximize', () => {
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowMaximized',
            payload: [id]
        });
    });
    window.on('show', () => {
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowShown',
            payload: [id]
        });
    });
    window.on('resized', () => {
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowResized',
            payload: [id, window.getSize()[0], window.getSize()[1]]
        });
    });
    window.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });
    window.on('close', (evt) => {
        if (state_1.default.windows[id]) {
            delete state_1.default.windows[id];
        }
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowClosed',
            payload: [id]
        });
    });
    window.on('hide', (evt) => {
        (0, utils_1.notifyLaravel)('events', {
            event: 'Native\\Laravel\\Events\\Windows\\WindowHidden',
            payload: [id]
        });
    });
    url += (url.indexOf('?') === -1 ? '?' : '&') + '_windowId=' + id;
    window.loadURL(url);
    window.webContents.on('did-finish-load', () => {
        window.show();
    });
    state_1.default.windows[id] = window;
    res.sendStatus(200);
});
exports.default = router;
