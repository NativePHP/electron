// import type { JestConfigWithTsJest } from 'ts-jest'
//
// const config: JestConfigWithTsJest = {
//     extensionsToTreatAsEsm: ['.ts'],
//     verbose: true,
//     preset: 'ts-jest/presets/default-esm',
//     testEnvironment: 'node',
//     transform: {
//         '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
//     },
//     testPathIgnorePatterns: ['./dist'],
//     moduleNameMapper: {
//         // '^electron$': '<rootDir>/tests/mocks/electron.ts',
//         "^(\\.{1,2}/.*)\\.js$": "$1",
//     }
// }
//
// export default config


import {createJsWithTsEsmPreset, type JestConfigWithTsJest} from 'ts-jest'

const presetConfig = createJsWithTsEsmPreset({
    //...options
})

const jestConfig: JestConfigWithTsJest ={
    ...presetConfig,

    moduleNameMapper: {
        '^electron$': '<rootDir>/tests/mocks/electron.ts',
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
}

console.log(jestConfig);

export default jestConfig
