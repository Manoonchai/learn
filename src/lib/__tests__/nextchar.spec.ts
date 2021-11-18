import { nextchar } from '../nextchar'

describe('nextchar', () => {
  it('returns the first char if the input is blank', () => {
    expect(nextchar('book', '')).toEqual('b')
  })

  it('returns the second char of the word if the input has one char', () => {
    expect(nextchar('book', 'b')).toEqual('o')
    expect(nextchar('book', 'x')).toEqual('o')
  })

  it('returns blank if the word is blank or undefined', () => {
    expect(nextchar('', '')).toEqual('')
    expect(nextchar('', 'b')).toEqual('')
    expect(nextchar(undefined, 'x')).toEqual('')
  })

  it('returns space if the word and the input has same length', () => {
    expect(nextchar('book', 'book')).toEqual(' ')
    expect(nextchar('book', 'good')).toEqual(' ')
    expect(nextchar('book', 'shelf')).toEqual(' ')
  })
})
