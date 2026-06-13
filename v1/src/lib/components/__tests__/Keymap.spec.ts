import { render, RenderResult } from '@testing-library/svelte'

import Keymap from '../Keymap.svelte'

describe('Keymap', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(Keymap, { nextChar: 'A' })
  })

  it('works', () => {
    expect(component.container).toBeInTheDocument()
  })
})
