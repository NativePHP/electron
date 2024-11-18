import {BrowserWindow, UtilityProcess} from "electron";

interface State {
    electronApiPort: number | null;
    activeMenuBar: any;
    php: string | null;
    phpPort: number | null;
    phpIni: any;
    caCert: string | null;
    icon: string | null;
    processes: Record<string, { pid: any, proc: UtilityProcess, settings: Record<string, any> }>;
    windows: Record<string, BrowserWindow>;
    randomSecret: string;
    findWindow: (id: string) => BrowserWindow | null;
}

function generateRandomString(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export default {
    electronApiPort: null,
    activeMenuBar: null,
    php: null,
    phpPort: null,
    phpIni: null,
    caCert: null,
    icon: null,
    randomSecret: generateRandomString(32),
    processes: {},
    windows: {},
    findWindow(id: string) {
        return this.windows[id] || null;
    },
} as State;
