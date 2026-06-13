import { describe, expect, it } from "vitest";
import type { DrillResult } from "$lib/engine";
import { shareData, shareFilename } from "./result-card";

const result: DrillResult = {
  rawWpm: 88.4,
  netWpm: 82.7,
  accuracy: 95.6,
  consistency: 71.2,
  correctChars: 410,
  totalChars: 430,
  errors: 20,
  seconds: 60.1,
  samples: [],
  words: [],
};

describe("shareData", () => {
  it("rounds the headline numbers and formats the local date", () => {
    const d = shareData(result, new Date(2026, 5, 13)); // June = month index 5
    expect(d).toEqual({
      netWpm: 83,
      rawWpm: 88,
      accuracy: 96,
      consistency: 71,
      seconds: 60,
      date: "2026-06-13",
    });
  });
});

describe("shareFilename", () => {
  it("names the file by wpm and date", () => {
    const d = shareData(result, new Date(2026, 5, 13));
    expect(shareFilename(d)).toBe("manoonchai-timeattack-83wpm-2026-06-13.png");
  });
});
