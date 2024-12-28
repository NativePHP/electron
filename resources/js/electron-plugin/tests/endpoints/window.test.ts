import startAPIServer, { APIProcess } from "../../src/server/api";
import axios from "axios";
import electron from "electron";

let apiServer: APIProcess;

jest.mock('electron', () => ({
    ...jest.requireActual('electron'),

    window: {
        hide: jest.fn(),
        show: jest.fn(),
    }
}));

describe('Window test', () => {
  beforeEach(async () => {
    apiServer = await startAPIServer('randomSecret')

    axios.defaults.baseURL = `http://localhost:${apiServer.port}/api`;
    axios.defaults.headers.common['x-nativephp-secret'] = 'randomSecret';
  })

  afterEach(done => {
    apiServer.server.close(done);
  });

  it('can hide a window', async () => {
    const response = await axios.post('/window/hide');
    expect(response.status).toBe(200);
    // expect(electron.window.show).toHaveBeenCalled();
  });

  it('can show a window', async () => {
    const response = await axios.post('/window/show');
    expect(response.status).toBe(200);
    // expect(electron.window.show).toHaveBeenCalled();
  });
});
