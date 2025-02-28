import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import startAPIServer, { APIProcess } from "../../src/server/api";
import axios from "axios";
import state from "../../src/server/state";

let apiServer: APIProcess;

// vi.mock('../../src/server/state', () => ({
//     ...vi.importActual('../../src/server/state'),
//     windows: {
//         main: {
//             hide: vi.fn(),
//             show: vi.fn(),
//         },
//     }
// }));

describe('Window test', () => {
    beforeEach(async () => {
        apiServer = await startAPIServer('randomSecret');

        axios.defaults.baseURL = `http://localhost:${apiServer.port}/api`;
        axios.defaults.headers.common['x-nativephp-secret'] = 'randomSecret';
    });

    afterEach(() => {
        return new Promise<void>((resolve) => {
            apiServer.server.close(() => resolve());
        });
    });

    it('can hide a window', async () => {
        const response = await axios.post('/window/hide', { id: 'main' });
        expect(response.status).toBe(200);
        expect(state.windows.main.hide).toHaveBeenCalled();
    });

    it('can show a window', async () => {
        const response = await axios.post('/window/show', { id: 'main' });
        expect(response.status).toBe(200);
        expect(state.windows.main.show).toHaveBeenCalled();
    });
});
