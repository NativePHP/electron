"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const get_port_1 = __importDefault(require("get-port"));
const middleware_1 = __importDefault(require("./api/middleware"));
const clipboard_1 = __importDefault(require("./api/clipboard"));
const app_1 = __importDefault(require("./api/app"));
const screen_1 = __importDefault(require("./api/screen"));
const dialog_1 = __importDefault(require("./api/dialog"));
const debug_1 = __importDefault(require("./api/debug"));
const broadcasting_1 = __importDefault(require("./api/broadcasting"));
const system_1 = __importDefault(require("./api/system"));
const globalShortcut_1 = __importDefault(require("./api/globalShortcut"));
const notification_1 = __importDefault(require("./api/notification"));
const dock_1 = __importDefault(require("./api/dock"));
const menu_1 = __importDefault(require("./api/menu"));
const menuBar_1 = __importDefault(require("./api/menuBar"));
const window_1 = __importDefault(require("./api/window"));
const process_1 = __importDefault(require("./api/process"));
const contextMenu_1 = __importDefault(require("./api/contextMenu"));
const settings_1 = __importDefault(require("./api/settings"));
const shell_1 = __importDefault(require("./api/shell"));
const progressBar_1 = __importDefault(require("./api/progressBar"));
const powerMonitor_1 = __importDefault(require("./api/powerMonitor"));
function startAPIServer(randomSecret) {
    return __awaiter(this, void 0, void 0, function* () {
        const port = yield (0, get_port_1.default)({
            port: get_port_1.default.makeRange(4000, 5000),
        });
        return new Promise((resolve, reject) => {
            const httpServer = (0, express_1.default)();
            httpServer.use((0, middleware_1.default)(randomSecret));
            httpServer.use(body_parser_1.default.json());
            httpServer.use("/api/clipboard", clipboard_1.default);
            httpServer.use("/api/app", app_1.default);
            httpServer.use("/api/screen", screen_1.default);
            httpServer.use("/api/dialog", dialog_1.default);
            httpServer.use("/api/system", system_1.default);
            httpServer.use("/api/global-shortcuts", globalShortcut_1.default);
            httpServer.use("/api/notification", notification_1.default);
            httpServer.use("/api/dock", dock_1.default);
            httpServer.use("/api/menu", menu_1.default);
            httpServer.use("/api/window", window_1.default);
            httpServer.use("/api/process", process_1.default);
            httpServer.use("/api/settings", settings_1.default);
            httpServer.use("/api/shell", shell_1.default);
            httpServer.use("/api/context", contextMenu_1.default);
            httpServer.use("/api/menu-bar", menuBar_1.default);
            httpServer.use("/api/progress-bar", progressBar_1.default);
            httpServer.use("/api/power-monitor", powerMonitor_1.default);
            httpServer.use("/api/broadcast", broadcasting_1.default);
            if (process.env.NODE_ENV === "development") {
                httpServer.use("/api/debug", debug_1.default);
            }
            const server = httpServer.listen(port, () => {
                resolve({
                    server,
                    port,
                });
            });
        });
    });
}
exports.default = startAPIServer;
