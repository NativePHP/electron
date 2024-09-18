"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.post('/', (req, res) => {
    const { event, payload } = req.body;
    (0, utils_1.broadcastToWindows)("native-event", { event, payload });
    res.sendStatus(200);
});
exports.default = router;
