/** Standard typing-speed convention: a "word" is five characters. */
export const CHARS_PER_WORD = 5;

/** Words-per-minute for `chars` characters typed over `seconds`. */
export function wpm(chars: number, seconds: number): number {
  if (!seconds || chars <= 0) return 0;
  return (chars / CHARS_PER_WORD / seconds) * 60;
}
