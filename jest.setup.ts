import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import 'jest-canvas-mock'

// Sveltekit Mocks
jest.mock('$app/env.js', () => ({
  amp: false,
  browser: false,
  dev: true,
  mode: 'test',
}))

jest.mock('$app/navigation.js', () => ({
  goto: jest.fn(),
}))

// In more recent tests I've started using the "TestHarness" instead of this `svelte` mock with a fake getContext
jest.mock('svelte', () => {
  const { writable } = require('svelte/store')
  const actualSvelte = jest.requireActual('svelte')
  const fakeGetContext = jest.fn((name) => {
    if (name === '__svelte__') {
      return fakeSvelteKitContext
    }
  })
  const fakeSvelteKitContext = {
    page: writable({
      path: '/',
      query: new URLSearchParams({
        offset: '0',
        limit: '5',
      }),
    }),
    navigating: writable(false),
  }

  const mockedSvelteKit = {
    ...actualSvelte,
    getContext: fakeGetContext,
  }
  return mockedSvelteKit
})
// End Sveltekit mocks

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
