"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.post('/', (req, res) => {
    const { key, event } = req.body;
    electron_1.globalShortcut.register(key, () => {
        (0, utils_1.notifyLaravel)('events', {
            event,
            payload: [key]
        });
    });
    res.sendStatus(200);
});
router.delete('/', (req, res) => {
    const { key } = req.body;
    electron_1.globalShortcut.unregister(key);
    res.sendStatus(200);
});
router.get('/:key', (req, res) => {
    const { key } = req.params;
    res.json({
        isRegistered: electron_1.globalShortcut.isRegistered(key)
    });
});
exports.default = router;
