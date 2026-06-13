import { render, RenderResult } from '@testing-library/svelte'

import KeymapButton from '../KeymapButton.svelte'

describe('KeymapButton', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(KeymapButton, { nextChar: 'A' })
  })

  it('works', () => {
    expect(component.container).toBeInTheDocument()
  })
})
