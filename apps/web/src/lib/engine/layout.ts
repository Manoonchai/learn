import manoonchai from "../data/manoonchai";

/** Physical key, base (unshifted) char, shifted char, finger-home marker. */
export interface LayoutKey {
  code: string;
  base: string;
  shift: string;
  /** True for the two index-finger "home" keys (the F/J of this layout). */
  home: boolean;
}

/** The three physical letter rows, left-to-right, as they sit on a keyboard. */
const ROW_CODES: string[][] = [
  [
    "KeyQ",
    "KeyW",
    "KeyE",
    "KeyR",
    "KeyT",
    "KeyY",
    "KeyU",
    "KeyI",
    "KeyO",
    "KeyP",
    "BracketLeft",
    "BracketRight",
    "Backslash",
  ],
  ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"],
  ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
];

/** Index-finger home keys — the ones that carry the tactile bump. */
const HOME_CODES = new Set(["KeyF", "KeyJ"]);

export const LAYOUT_ROWS: LayoutKey[][] = ROW_CODES.map((row) =>
  row.map((code) => {
    const pair = (manoonchai as Record<string, string[]>)[code] ?? ["", ""];
    return { code, base: pair[0], shift: pair[1], home: HOME_CODES.has(code) };
  }),
);

/**
 * Resolve a physical key press to its Manoonchai character. Returns "" for keys
 * outside the layout (so the OS keyboard layout never matters).
 */
export function resolveKey(code: string, shift: boolean): string {
  const pair = (manoonchai as Record<string, string[]>)[code];
  if (!pair) return "";
  return pair[shift ? 1 : 0] ?? "";
}

/** True if `char` is reachable only via Shift on this layout. */
export function isShifted(char: string): boolean {
  if (!char) return false;
  for (const row of LAYOUT_ROWS) {
    for (const key of row) {
      if (key.base === char) return false;
      if (key.shift === char) return true;
    }
  }
  return false;
}
