import { createJsWithTsEsmPreset, type JestConfigWithTsJest } from 'ts-jest'

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

export default jestConfig
