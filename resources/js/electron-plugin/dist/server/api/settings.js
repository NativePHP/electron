"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const state_1 = __importDefault(require("../state"));
const router = express_1.default.Router();
router.get('/:key', (req, res) => {
    const key = req.params.key;
    const value = state_1.default.store.get(key, null);
    res.json({ value });
});
router.post('/:key', (req, res) => {
    const key = req.params.key;
    const value = req.body.value;
    state_1.default.store.set(key, value);
    res.sendStatus(200);
});
router.delete('/:key', (req, res) => {
    const key = req.params.key;
    state_1.default.store.delete(key);
    res.sendStatus(200);
});
exports.default = router;
