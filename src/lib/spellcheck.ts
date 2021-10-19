export function spellcheck(word: string, input: string): boolean {
  return word.indexOf(input) === 0
}
