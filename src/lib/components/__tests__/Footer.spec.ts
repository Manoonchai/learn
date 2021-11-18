import { render, RenderResult } from '@testing-library/svelte'

import Footer from '../Footer.svelte'

describe('Footer', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(Footer, {})
  })

  it('works', () => {
    expect(component.container).toBeInTheDocument()
  })
})
