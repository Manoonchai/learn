/** Allowed drill lengths (number of sampled words). */
export const DRILL_LENGTHS = [10, 25, 50] as const;
export type DrillLength = (typeof DRILL_LENGTHS)[number];

/**
 * Build a drill: `length` words sampled with replacement from `pool`. `rng` is
 * injectable so drills are deterministic in tests. Words can repeat, matching
 * v1's behaviour and keeping short lessons usable.
 */
export function buildDrill(
  pool: string[],
  length: number,
  rng: () => number = Math.random,
): string[] {
  if (pool.length === 0) return [];
  return Array.from({ length }, () => pool[Math.floor(rng() * pool.length)] ?? "");
}
