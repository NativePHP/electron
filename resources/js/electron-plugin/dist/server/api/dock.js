"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const helper_1 = require("./helper");
const router = express_1.default.Router();
router.post('/', (req, res) => {
    const menuEntries = req.body.items.map(helper_1.mapMenu);
    const menu = electron_1.Menu.buildFromTemplate(menuEntries);
    electron_1.app.dock.setMenu(menu);
    res.sendStatus(200);
});
exports.default = router;
