import thaiData from "../data/thai.json";
import { isTypeable } from "./layout";
import { buildDrill } from "./drill";

const allWords: string[] = (thaiData as { words: string[] }).words;

/**
 * The full Thai word set Time Attack samples from: the Manoonchai project's
 * frequency-ordered corpus, filtered to words that are fully typeable on the
 * layout. See docs/adr/0002 and the "Full word set" term in CONTEXT.md.
 */
export const fullWordSet: string[] = allWords.filter(isTypeable);

/** How many words filtering dropped — asserted ~0 in tests, useful when debugging. */
export const droppedWordCount = allWords.length - fullWordSet.length;

/** Sample `count` words uniformly (with replacement) from the full word set. */
export function buildTimeAttack(count: number, rng: () => number = Math.random): string[] {
  return buildDrill(fullWordSet, count, rng);
}
