/** A lesson: a named curriculum unit holding a pool of Thai words. */
export interface Lesson {
  name: string;
  words: string[];
}

/**
 * One recorded keystroke that produced a Manoonchai character. Space (word
 * commit) is recorded too, with `expected`/`correct` reflecting whether the
 * just-typed word matched its target.
 */
export interface Keystroke {
  /** The Manoonchai character produced (or " " for a word commit). */
  char: string;
  /** Whether it matched the expected next character at the time. */
  correct: boolean;
  /** Milliseconds since the drill started. */
  t: number;
}

/** Per-second sample for the performance chart. */
export interface WpmSample {
  /** Second index (1-based, for display). */
  second: number;
  /** Raw WPM in this one-second window. */
  raw: number;
  /** Net WPM: cumulative, error-penalised. */
  net: number;
  /** Errors committed during this second (drives error markers). */
  errors: number;
}

/** The headline numbers shown at the end of a drill. */
export interface DrillResult {
  rawWpm: number;
  netWpm: number;
  accuracy: number;
  /** Cadence evenness as a percentage (100 − CV of per-second raw WPM). */
  consistency: number;
  /** Total correct characters typed (excludes spaces). */
  correctChars: number;
  /** Total characters typed (excludes spaces). */
  totalChars: number;
  errors: number;
  seconds: number;
  samples: WpmSample[];
}
