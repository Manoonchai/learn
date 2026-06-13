import { describe, expect, it } from "vitest";
import type { WordStat } from "./types";
import { speedThresholds, bucketOf, SPEED_BUCKETS } from "./word-history";

const w = (wpm: number): WordStat => ({ text: "x", correct: true, wpm });

describe("speedThresholds", () => {
  it("returns empty when there are no timed words", () => {
    expect(speedThresholds([])).toEqual([]);
    expect(speedThresholds([w(0), w(0)])).toEqual([]);
  });

  it("returns empty when every word has the same speed", () => {
    expect(speedThresholds([w(40), w(40), w(40)])).toEqual([]);
  });

  it("splits [min,max] into 5 bands with 4 interior thresholds", () => {
    // min 0(excluded since >0 filter) -> use 10..60, step (60-10)/5 = 10.
    const t = speedThresholds([w(10), w(60)]);
    expect(t).toHaveLength(SPEED_BUCKETS - 1);
    expect(t).toEqual([20, 30, 40, 50]);
  });
});

describe("bucketOf", () => {
  const thresholds = [20, 30, 40, 50];

  it("places the slowest in bucket 0 and fastest in the top bucket", () => {
    expect(bucketOf(10, thresholds)).toBe(0);
    expect(bucketOf(60, thresholds)).toBe(4);
  });

  it("places a value at a threshold into the higher bucket", () => {
    expect(bucketOf(20, thresholds)).toBe(1);
    expect(bucketOf(40, thresholds)).toBe(3);
  });

  it("returns bucket 0 when there are no thresholds", () => {
    expect(bucketOf(99, [])).toBe(0);
  });
});
