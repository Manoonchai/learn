import { spellcheck } from '../../src/lib/spellcheck'

describe('spellcheck', () => {
  it('returns true when the input is abc and the word is abcd', () => {
    expect(spellcheck('abcd', 'abc')).toEqual(true)
  })

  it('returns true when the input is blank', () => {
    expect(spellcheck('xyz', '')).toEqual(true)
  })

  it('returns false when the input is not matching the word substring', () => {
    expect(spellcheck('abc', 'aa')).toEqual(false)
  })

  it('returns false when input is longer than the word', () => {
    expect(spellcheck('abc', 'abcd')).toEqual(false)
  })
})
