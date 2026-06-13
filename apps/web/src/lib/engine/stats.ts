import type { DrillResult, WordStat, WpmSample } from "./types";
import { CHARS_PER_WORD, consistency, wpm } from "./wpm";

interface CharRecord {
  correct: boolean;
  /** Milliseconds since the drill started. */
  t: number;
}

interface WordRecord {
  text: string;
  correct: boolean;
  /** Milliseconds since the drill started, at the moment the word committed. */
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
  private wordRecords: WordRecord[] = [];

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

  /** Record a committed word (its target text + correctness). Ignored before `start()`. */
  recordWord(text: string, correct: boolean, now: number): void {
    if (!this.started) return;
    this.wordRecords.push({ text, correct, t: now - this.startedAt });
  }

  /** Per-word speeds, in commit order. Each word's time is measured from the
   * previous commit (or the drill start for the first word). */
  private words(): WordStat[] {
    return this.wordRecords.map((wr, i) => {
      const prevT = i > 0 ? this.wordRecords[i - 1].t : 0;
      const seconds = Math.max((wr.t - prevT) / 1000, 0);
      const chars = [...wr.text].length;
      return {
        text: wr.text,
        correct: wr.correct,
        wpm: seconds > 0 ? (chars / CHARS_PER_WORD / seconds) * 60 : 0,
      };
    });
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
    const samples = this.samples(now);

    return {
      rawWpm: wpm(totalChars, seconds),
      netWpm: wpm(correctChars, seconds),
      accuracy: totalChars ? (correctChars / totalChars) * 100 : 100,
      consistency: consistency(samples.map((s) => s.raw)),
      correctChars,
      totalChars,
      errors,
      seconds,
      samples,
      words: this.words(),
    };
  }
}
