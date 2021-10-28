import userEvent from '@testing-library/user-event'
import { render, RenderResult } from '@testing-library/svelte'

import Index from '../../src/routes/index.svelte'

/**
 * @jest-environment jsdom
 */

/**
 * An example test suite outlining the usage of
 * `describe()`, `beforeEach()`, `test()` and `expect()`
 *
 * @see https://jestjs.io/docs/getting-started
 * @see https://github.com/testing-library/jest-dom
 */

describe('Index', () => {
  let renderedComponent: RenderResult

  beforeEach(() => {
    renderedComponent = render(Index, { testMode: true, words: ['งเรน'] })
  })

  describe('once the component has been rendered', () => {
    it('shows the title', () => {
      expect(renderedComponent.getByText(/Manoonchai/)).toBeInTheDocument()
    })

    it('renders the randomized words', () => {
      expect(renderedComponent.getAllByText('งเรน').length).toBeGreaterThan(0)
    })

    it('highlights the first word green color', () => {
      const firstWordElement = renderedComponent.getAllByText('งเรน')[0]

      expect(firstWordElement).toHaveClass('bg-green-300')
    })
  })

  describe('when the word is typed correctly', () => {
    fit('renders the word as green color (correct)', async () => {
      const input = renderedComponent.getByTestId('input') as HTMLInputElement
      expect(input).toBeInTheDocument()

      await userEvent.type(input, 'asdf{space}')

      const firstWordElement = renderedComponent.getAllByText('งเรน')[0]

      expect(firstWordElement).toHaveClass('text-green-400')
    })
  })

  describe('when the word is typed incorrectly', () => {
    it('renders the word as red color (incorrect)', async () => {
      const input = renderedComponent.getByTestId('input') as HTMLInputElement
      expect(input).toBeInTheDocument()

      await userEvent.type(input, 'zxcd{space}')

      const firstWordElement = renderedComponent.getAllByText('งเรน')[0]

      expect(firstWordElement).toHaveClass('text-red-600')
    })
  })
})
