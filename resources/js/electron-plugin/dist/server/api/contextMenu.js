"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helper_1 = require("./helper");
const electron_context_menu_1 = __importDefault(require("electron-context-menu"));
const router = express_1.default.Router();
let contextMenuDisposable = null;
router.delete('/', (req, res) => {
    res.sendStatus(200);
    if (contextMenuDisposable) {
        contextMenuDisposable();
        contextMenuDisposable = null;
    }
});
router.post('/', (req, res) => {
    res.sendStatus(200);
    if (contextMenuDisposable) {
        contextMenuDisposable();
        contextMenuDisposable = null;
    }
    contextMenuDisposable = (0, electron_context_menu_1.default)({
        showLookUpSelection: false,
        showSearchWithGoogle: false,
        showInspectElement: false,
        prepend: (defaultActions, parameters, browserWindow) => {
            return req.body.entries.map(helper_1.mapMenu);
        }
    });
});
exports.default = router;
