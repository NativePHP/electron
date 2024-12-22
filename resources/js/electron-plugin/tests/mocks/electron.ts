import {jest} from '@jest/globals';

export default {
    __esModule: true,
    app: {
        getPath: jest.fn(() => '/path/to/app'),
        isPackaged: false,
    },
    powerMonitor: {
        addListener: jest.fn(),
    },
}
