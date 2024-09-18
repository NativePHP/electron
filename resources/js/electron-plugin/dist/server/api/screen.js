"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const router = express_1.default.Router();
router.get('/displays', (req, res) => {
    res.json({
        displays: electron_1.screen.getAllDisplays()
    });
});
router.get('/primary-display', (req, res) => {
    res.json({
        primaryDisplay: electron_1.screen.getPrimaryDisplay()
    });
});
router.get('/cursor-position', (req, res) => {
    res.json(electron_1.screen.getCursorScreenPoint());
});
exports.default = router;
