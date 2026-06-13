import type { WordStat } from "./types";

/** Number of speed buckets the input history is coloured into. */
export const SPEED_BUCKETS = 5;

/**
 * Split the run's per-word speeds into `count` equal bands across [min, max]
 * and return the `count - 1` interior thresholds. Buckets are relative to this
 * run (Monkeytype-style), so colouring is meaningful at any absolute speed.
 * Returns `[]` when there is no spread to divide (0 or 1 distinct speed).
 */
export function speedThresholds(words: WordStat[], count = SPEED_BUCKETS): number[] {
  const wpms = words.filter((w) => w.wpm > 0).map((w) => w.wpm);
  if (wpms.length === 0) return [];
  const min = Math.min(...wpms);
  const max = Math.max(...wpms);
  if (min === max) return [];
  const step = (max - min) / count;
  return Array.from({ length: count - 1 }, (_, i) => min + step * (i + 1));
}

/** Bucket index (0 = slowest) for `wpm` given ascending `thresholds`. */
export function bucketOf(wpm: number, thresholds: number[]): number {
  let bucket = 0;
  for (const t of thresholds) {
    if (wpm >= t) bucket++;
    else break;
  }
  return bucket;
}
