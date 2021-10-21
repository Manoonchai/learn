export function nextchar(word: string | undefined, input: string): string {
  if (!word) {
    return ''
  }

  if (!input) {
    return word[0] || ''
  }

  if (word.length <= input.length) {
    return ' '
  }

  return word[input.length] || ''
}
