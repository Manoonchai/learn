/** Standard typing-speed convention: a "word" is five characters. */
export const CHARS_PER_WORD = 5;

/** Words-per-minute for `chars` characters typed over `seconds`. */
export function wpm(chars: number, seconds: number): number {
  if (!seconds || chars <= 0) return 0;
  return (chars / CHARS_PER_WORD / seconds) * 60;
}

/**
 * How even the per-second raw WPM was, as a percentage: 100 − coefficient of
 * variation (stddev ÷ mean), floored at 0. Flat cadence → 100; bursts and
 * stalls → lower. See the "Consistency" term in CONTEXT.md.
 */
export function consistency(rawPerSecond: number[]): number {
  const n = rawPerSecond.length;
  if (n === 0) return 0;
  const mean = rawPerSecond.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return 0;
  if (n < 2) return 100;
  const variance = rawPerSecond.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, (1 - cv) * 100);
}
