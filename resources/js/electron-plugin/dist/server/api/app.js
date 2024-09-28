"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const router = express_1.default.Router();
router.post('/show', (req, res) => {
    electron_1.app.show();
    res.sendStatus(200);
});
router.post('/hide', (req, res) => {
    electron_1.app.hide();
    res.sendStatus(200);
});
router.get('/is-hidden', (req, res) => {
    res.json({
        is_hidden: electron_1.app.isHidden(),
    });
});
router.get('/app-path', (req, res) => {
    res.json({
        path: electron_1.app.getAppPath(),
    });
});
router.get('/path/:name', (req, res) => {
    res.json({
        path: electron_1.app.getPath(req.params.name),
    });
});
router.get('/version', (req, res) => {
    res.json({
        version: electron_1.app.getVersion(),
    });
});
router.post('/badge-count', (req, res) => {
    electron_1.app.setBadgeCount(req.body.count);
    res.sendStatus(200);
});
router.get('/badge-count', (req, res) => {
    res.json({
        count: electron_1.app.getBadgeCount(),
    });
});
router.post('/recent-documents', (req, res) => {
    electron_1.app.addRecentDocument(req.body.path);
    res.sendStatus(200);
});
router.delete('/recent-documents', (req, res) => {
    electron_1.app.clearRecentDocuments();
    res.sendStatus(200);
});
exports.default = router;
