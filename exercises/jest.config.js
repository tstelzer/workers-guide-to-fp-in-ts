module.exports = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.json'
        }
    },
    roots: [
        "./chapters",
    ],
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'js']
}
