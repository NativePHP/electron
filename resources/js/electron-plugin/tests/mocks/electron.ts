export default {
    app: {
        getPath: jest.fn(() => '/path/to/app'),
    },
    powerMonitor: {
        addListener: jest.fn(),
    },
}
