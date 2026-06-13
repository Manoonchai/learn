import { render, RenderResult } from '@testing-library/svelte'

import LibLoader from '../LibLoader.svelte'

describe('LibLoader', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(LibLoader, { src: 'foo', libraryDetectionObject: {} })
  })

  it('works', () => {
    expect(component.container).toBeInTheDocument()
  })
})
