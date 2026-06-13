/**
 * True while `input` is still a correct prefix of `target` (or empty). The drill
 * uses this to flag a wrong keystroke the moment it diverges, before space.
 */
export function isPrefixCorrect(target: string | undefined, input: string): boolean {
  return !target || target.startsWith(input);
}
