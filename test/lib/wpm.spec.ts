import { calculateWpm } from '../../src/lib/wpm'

it('works', () => {
  expect(calculateWpm).toBeDefined()
})

describe('input 5 characters and 60 seconds', () => {
  it('returns 1 wpm', () => {
    expect(calculateWpm('abcde', 60)).toEqual(1)
  })
})

describe('input 5 characters and 30 seconds', () => {
  it('returns 2 wpm', () => {
    expect(calculateWpm('abcde', 30)).toEqual(2)
  })
})

describe('input 7 characters and 60 seconds', () => {
  it('returns 1.4 wpm', () => {
    expect(calculateWpm('abcdefg', 60)).toEqual(1.4)
  })
})

describe('input multiple words', () => {
  it('returns wpm for all words', () => {
    const words = ['อม', 'ออม', 'นอม', 'นม', 'อม']

    expect(calculateWpm(words, 60)).toEqual(2.4)
  })
})

describe('for 0 seconds', () => {
  it('returns 0', () => {
    expect(calculateWpm(['abcde'], 0)).toEqual(0)
  })
})

describe('when the words are blank', () => {
  it('returns 0', () => {
    expect(calculateWpm([], 60)).toEqual(0)
  })
})
