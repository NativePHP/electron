"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const electron_1 = require("electron");
const utils_1 = require("../utils");
const router = express_1.default.Router();
router.get('/get-system-idle-state', (req, res) => {
    res.json({
        result: electron_1.powerMonitor.getSystemIdleState(req.body.threshold),
    });
});
router.get('/get-system-idle-time', (req, res) => {
    res.json({
        result: electron_1.powerMonitor.getSystemIdleTime(),
    });
});
router.get('/get-current-thermal-state', (req, res) => {
    res.json({
        result: electron_1.powerMonitor.getCurrentThermalState(),
    });
});
router.get('/is-on-battery-power', (req, res) => {
    res.json({
        result: electron_1.powerMonitor.isOnBatteryPower(),
    });
});
electron_1.powerMonitor.addListener('on-ac', () => {
    (0, utils_1.notifyLaravel)("events", {
        event: `\\Native\\Laravel\\Events\\PowerMonitor\\PowerStateChanged`,
        payload: {
            state: 'on-ac'
        }
    });
});
electron_1.powerMonitor.addListener('on-battery', () => {
    (0, utils_1.notifyLaravel)("events", {
        event: `\\Native\\Laravel\\Events\\PowerMonitor\\PowerStateChanged`,
        payload: {
            state: 'on-battery'
        }
    });
});
electron_1.powerMonitor.addListener('thermal-state-change', (state) => {
    (0, utils_1.notifyLaravel)("events", {
        event: `\\Native\\Laravel\\Events\\PowerMonitor\\ThermalStateChanged`,
        payload: {
            state
        }
    });
});
electron_1.powerMonitor.addListener('speed-limit-change', (limit) => {
    (0, utils_1.notifyLaravel)("events", {
        event: `\\Native\\Laravel\\Events\\PowerMonitor\\SpeedLimitChanged`,
        payload: {
            limit
        }
    });
});
exports.default = router;
