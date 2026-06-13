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
