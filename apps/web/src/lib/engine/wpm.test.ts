import { describe, expect, it } from "vitest";
import { CHARS_PER_WORD, consistency, wpm } from "./wpm";

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

describe("consistency", () => {
  it("is 0 with no samples", () => {
    expect(consistency([])).toBe(0);
  });

  it("is 0 when nothing was typed (mean 0)", () => {
    expect(consistency([0, 0, 0])).toBe(0);
  });

  it("is 100 for a perfectly flat cadence", () => {
    expect(consistency([40, 40, 40, 40])).toBe(100);
  });

  it("is 100 for a single sample (no spread to measure)", () => {
    expect(consistency([55])).toBe(100);
  });

  it("drops below 100 as the cadence varies", () => {
    const c = consistency([20, 60]); // mean 40, sd 20, cv 0.5 -> 50
    expect(c).toBeCloseTo(50, 5);
  });
});
