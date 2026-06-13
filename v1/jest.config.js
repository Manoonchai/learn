const esModules = ['chart.js', 'svelte-jester', 'svelte-fa'].join('|')

export default {
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
  },
  transformIgnorePatterns: [`node_modules/(?!${esModules})`],
  moduleNameMapper: {
    '^\\$lib(.*)$': '<rootDir>/src/lib$1',
    '^\\$app(.*)$': [
      '<rootDir>/.svelte-kit/dev/runtime/app$1',
      '<rootDir>/.svelte-kit/build/runtime/app$1',
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,svelte,js,jsx}'],
  extensionsToTreatAsEsm: ['.svelte', '.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',
      useESM: true,
    },
  },
  testEnvironment: 'jsdom',
}
