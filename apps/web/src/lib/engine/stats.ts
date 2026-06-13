import type { DrillResult, WpmSample } from "./types";
import { CHARS_PER_WORD, wpm } from "./wpm";

interface CharRecord {
  correct: boolean;
  /** Milliseconds since the drill started. */
  t: number;
}

/**
 * Records every character keystroke (not spaces) with its timestamp and
 * correctness, then derives honest stats from that single source:
 *
 *  - raw WPM  — characters typed in each one-second window (chars ÷ 5 × 60),
 *  - net WPM  — cumulative correct characters over elapsed time,
 *  - accuracy — correct ÷ total characters,
 *  - errors   — incorrect keystrokes, bucketed per second for chart markers.
 *
 * See docs/adr/0001-honest-stats-engine.md for why this replaces v1's math.
 */
export class StatsTracker {
  private startedAt = 0;
  private started = false;
  private records: CharRecord[] = [];

  start(now: number): void {
    if (this.started) return;
    this.startedAt = now;
    this.started = true;
  }

  get isStarted(): boolean {
    return this.started;
  }

  /** Record one character keystroke. Ignored before `start()`. */
  recordChar(correct: boolean, now: number): void {
    if (!this.started) return;
    this.records.push({ correct, t: now - this.startedAt });
  }

  /** Per-second samples for the live and end-of-drill chart. */
  samples(now: number): WpmSample[] {
    if (!this.records.length) return [];

    const elapsedMs = Math.max(now - this.startedAt, this.records[this.records.length - 1].t);
    const totalSeconds = Math.max(1, Math.ceil(elapsedMs / 1000));
    const out: WpmSample[] = [];

    let idx = 0;
    let cumulativeCorrect = 0;
    for (let second = 1; second <= totalSeconds; second++) {
      const windowEnd = second * 1000;
      let inWindow = 0;
      let errors = 0;
      while (idx < this.records.length && this.records[idx].t < windowEnd) {
        inWindow++;
        if (this.records[idx].correct) cumulativeCorrect++;
        else errors++;
        idx++;
      }
      out.push({
        second,
        raw: (inWindow * 60) / CHARS_PER_WORD,
        net: wpm(cumulativeCorrect, second),
        errors,
      });
    }
    return out;
  }

  /** Final headline numbers for the drill. */
  build(now: number): DrillResult {
    const totalChars = this.records.length;
    const correctChars = this.records.filter((r) => r.correct).length;
    const errors = totalChars - correctChars;
    const seconds = this.started ? Math.max((now - this.startedAt) / 1000, 0) : 0;

    return {
      rawWpm: wpm(totalChars, seconds),
      netWpm: wpm(correctChars, seconds),
      accuracy: totalChars ? (correctChars / totalChars) * 100 : 100,
      correctChars,
      totalChars,
      errors,
      seconds,
      samples: this.samples(now),
    };
  }
}
