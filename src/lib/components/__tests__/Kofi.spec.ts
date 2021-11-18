import { render, RenderResult } from '@testing-library/svelte'

import Kofi from '../Kofi.svelte'

describe('Kofi', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(Kofi, { name: 'narze' })
  })

  it('works', () => {
    expect(component.container).toBeInTheDocument()
  })
})
