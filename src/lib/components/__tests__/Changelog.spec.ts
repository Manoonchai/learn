import { render, RenderResult } from '@testing-library/svelte'

import Changelog from '../Changelog.svelte'

describe('Changelog', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(Changelog, { closeModal: () => false })
  })

  it('works', () => {
    expect(component.container).toBeInTheDocument()
  })
})
