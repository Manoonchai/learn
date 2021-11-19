import { render, RenderResult } from '@testing-library/svelte'

import LessonModal from '../LessonModal.svelte'

describe('LessonModal', () => {
  let component: RenderResult

  beforeEach(() => {
    component = render(LessonModal, { closeModal: () => false })
  })

  it('works', () => {
    expect(component.container).toBeInTheDocument()
  })
})
