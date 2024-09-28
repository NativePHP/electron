"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const router = express.Router();
const electron_1 = require("electron");
const DEFAULT_TYPE = 'clipboard';
router.get('/text', (req, res) => {
    const { type } = req.query;
    res.json({
        text: electron_1.clipboard.readText(type || DEFAULT_TYPE)
    });
});
router.post('/text', (req, res) => {
    const { text } = req.body;
    const { type } = req.query;
    electron_1.clipboard.writeText(text, type || DEFAULT_TYPE);
    res.json({
        text,
    });
});
router.get('/html', (req, res) => {
    const { type } = req.query;
    res.json({
        html: electron_1.clipboard.readHTML(type || DEFAULT_TYPE)
    });
});
router.post('/html', (req, res) => {
    const { html } = req.body;
    const { type } = req.query;
    electron_1.clipboard.writeHTML(html, type || DEFAULT_TYPE);
    res.json({
        html,
    });
});
router.get('/image', (req, res) => {
    const { type } = req.query;
    const image = electron_1.clipboard.readImage(type || DEFAULT_TYPE);
    res.json({
        image: image.isEmpty() ? null : image.toDataURL()
    });
});
router.post('/image', (req, res) => {
    const { image } = req.body;
    const { type } = req.query;
    try {
        const _nativeImage = electron_1.nativeImage.createFromDataURL(image);
        electron_1.clipboard.writeImage(_nativeImage, type || DEFAULT_TYPE);
    }
    catch (e) {
        res.status(400).json({
            error: e.message,
        });
        return;
    }
    res.sendStatus(200);
});
router.delete('/', (req, res) => {
    const { type } = req.query;
    electron_1.clipboard.clear(type || DEFAULT_TYPE);
    res.sendStatus(200);
});
exports.default = router;
