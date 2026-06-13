import { describe, expect, it } from "vitest";
import { CHARS_PER_WORD, wpm } from "./wpm";

describe("wpm", () => {
  it("treats 5 characters as one word", () => {
    expect(CHARS_PER_WORD).toBe(5);
    // 25 chars in 60s = 5 words/min
    expect(wpm(25, 60)).toBe(5);
  });

  it("scales with time", () => {
    // 5 chars (1 word) in 1s = 60 wpm
    expect(wpm(5, 1)).toBe(60);
  });

  it("returns 0 for zero time or non-positive chars", () => {
    expect(wpm(10, 0)).toBe(0);
    expect(wpm(0, 10)).toBe(0);
    expect(wpm(-3, 10)).toBe(0);
  });
});
