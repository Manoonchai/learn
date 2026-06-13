import { describe, expect, it } from "vitest";
import { isTypeable } from "./layout";
import { fullWordSet, droppedWordCount, buildTimeAttack } from "./full-word-set";

describe("fullWordSet", () => {
  it("has the bulk of the corpus", () => {
    expect(fullWordSet.length).toBeGreaterThan(900);
  });

  it("contains only layout-typeable words", () => {
    expect(fullWordSet.every(isTypeable)).toBe(true);
  });

  it("drops no typeable words from a modern frequency list", () => {
    // If this ever fails, inspect which words are untypeable before relaxing it.
    expect(droppedWordCount).toBe(0);
  });
});

describe("buildTimeAttack", () => {
  it("samples the requested count from the full set", () => {
    const words = buildTimeAttack(50, () => 0);
    expect(words).toHaveLength(50);
    // rng() === 0 always picks index 0.
    expect(new Set(words)).toEqual(new Set([fullWordSet[0]]));
  });

  it("draws from the full word set, not a lesson pool", () => {
    const seq = [0.1, 0.5, 0.9, 0.3];
    let i = 0;
    const words = buildTimeAttack(4, () => seq[i++ % seq.length]);
    expect(words.every((w) => fullWordSet.includes(w))).toBe(true);
  });
});
