import { describe, expect, it } from "vitest";
import { StatsTracker } from "./stats";

describe("StatsTracker", () => {
  it("reports a clean slate before any keystroke", () => {
    const s = new StatsTracker();
    const r = s.build(0);
    expect(r.totalChars).toBe(0);
    expect(r.accuracy).toBe(100);
    expect(r.samples).toEqual([]);
  });

  it("ignores keystrokes recorded before start()", () => {
    const s = new StatsTracker();
    s.recordChar(true, 500);
    expect(s.build(1000).totalChars).toBe(0);
  });

  it("derives raw/net/accuracy honestly from one second of input", () => {
    const s = new StatsTracker();
    s.start(0);
    s.recordChar(true, 200);
    s.recordChar(true, 400);
    s.recordChar(false, 600);
    const r = s.build(1000);

    expect(r.totalChars).toBe(3);
    expect(r.correctChars).toBe(2);
    expect(r.errors).toBe(1);
    expect(r.accuracy).toBeCloseTo(66.67, 1);
    expect(r.seconds).toBe(1);
    expect(r.rawWpm).toBeCloseTo(36, 5); // 3 chars / 5 * 60 / 1s
    expect(r.netWpm).toBeCloseTo(24, 5); // 2 correct / 5 * 60 / 1s

    expect(r.samples).toEqual([{ second: 1, raw: 36, net: 24, errors: 1 }]);
  });

  it("reports consistency derived from per-second raw samples", () => {
    const s = new StatsTracker();
    s.start(0);
    s.recordChar(true, 500); // second 1: raw 12
    s.recordChar(true, 1500); // second 2: raw 12
    const r = s.build(2000);
    // Two equal raw samples (12, 12) -> perfectly consistent.
    expect(r.consistency).toBe(100);
  });

  it("has 0 consistency on a clean slate", () => {
    expect(new StatsTracker().build(0).consistency).toBe(0);
  });

  it("records per-word speed from commit timings", () => {
    const s = new StatsTracker();
    s.start(0);
    // "นม" = 2 chars committed 1s in: 2/5/1*60 = 24 wpm.
    s.recordWord("นม", true, 1000);
    // "กา" = 2 chars committed 0.5s after the first: 2/5/0.5*60 = 48 wpm.
    s.recordWord("กา", false, 1500);
    const r = s.build(1500);

    expect(r.words).toEqual([
      { text: "นม", correct: true, wpm: 24 },
      { text: "กา", correct: false, wpm: 48 },
    ]);
  });

  it("buckets samples per second with cumulative net WPM", () => {
    const s = new StatsTracker();
    s.start(0);
    s.recordChar(true, 500); // second 1
    s.recordChar(true, 1500); // second 2
    const r = s.build(2000);

    expect(r.samples).toEqual([
      { second: 1, raw: 12, net: 12, errors: 0 },
      { second: 2, raw: 12, net: 12, errors: 0 },
    ]);
  });
});
