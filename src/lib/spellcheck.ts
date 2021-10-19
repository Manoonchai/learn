export function spellcheck(word: string | undefined, input: string): boolean {
  return !word || word.indexOf(input) === 0
}
