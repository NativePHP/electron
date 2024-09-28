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
    const { title, body, subtitle, silent, icon, hasReply, timeoutType, replyPlaceholder, sound, urgency, actions, closeButtonText, toastXml } = req.body;
    const notification = new electron_1.Notification({ title, body, subtitle, silent, icon, hasReply, timeoutType, replyPlaceholder, sound, urgency, actions, closeButtonText, toastXml });
    notification.on("click", (event) => {
        (0, utils_1.notifyLaravel)('events', {
            event: '\\Native\\Laravel\\Events\\Notifications\\NotificationClicked',
            payload: []
        });
    });
    notification.show();
    res.sendStatus(200);
});
exports.default = router;
