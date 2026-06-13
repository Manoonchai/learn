/**
 * The character the learner should type next, given the target word and their
 * input so far. Drives the keymap glow and the inline hint. Returns " " when the
 * word is complete (press space), and "" when there is no target.
 */
export function nextKey(target: string | undefined, input: string): string {
  if (!target) return "";
  if (!input) return target[0] ?? "";
  if (target.length <= input.length) return " ";
  return target[input.length] ?? "";
}
