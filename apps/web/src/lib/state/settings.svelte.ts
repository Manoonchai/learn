import { browser } from "$app/environment";
import type { DrillLength } from "$lib/engine";

export type Theme = "light" | "dark" | "system";

/** How the live caret is drawn in the typing flow (Monkeytype-style options). */
export type CaretStyle = "line" | "block" | "underline" | "off";

/** Which activity is active: lesson practice or a timed speed run. */
export type Mode = "lesson" | "timeAttack";

const KEY = "learn-manoonchai:v2";

interface Persisted {
  showKeymap: boolean;
  glow: boolean;
  caretStyle: CaretStyle;
  theme: Theme;
  drillLength: DrillLength;
  mode: Mode;
  currentLessonName?: string;
}

const DEFAULTS: Persisted = {
  showKeymap: true,
  glow: true,
  caretStyle: "line",
  theme: "system",
  drillLength: 25,
  mode: "lesson",
  currentLessonName: undefined,
};

function load(): Persisted {
  if (!browser) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * App settings, persisted to localStorage and reactive via runes. Only the
 * controls the redesign keeps: keymap + glow, caret style, theme, and drill
 * length. (v1's logo / Esc / Tab toggles became fixed behaviours.)
 */
class Settings {
  showKeymap = $state(true);
  glow = $state(true);
  caretStyle = $state<CaretStyle>("line");
  theme = $state<Theme>("system");
  drillLength = $state<DrillLength>(25);
  mode = $state<Mode>("lesson");
  currentLessonName = $state<string | undefined>(undefined);

  #systemDark = $state(false);
  #initialized = false;

  /** Whether the dark theme is currently active, resolving "system". */
  get resolvedDark(): boolean {
    return this.theme === "dark" || (this.theme === "system" && this.#systemDark);
  }

  /** Hydrate from storage and wire up persistence + theme application. */
  init(): void {
    if (!browser || this.#initialized) return;
    this.#initialized = true;

    const p = load();
    this.showKeymap = p.showKeymap;
    this.glow = p.glow;
    this.caretStyle = p.caretStyle;
    this.theme = p.theme;
    this.drillLength = p.drillLength;
    this.mode = p.mode;
    this.currentLessonName = p.currentLessonName;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    this.#systemDark = mq.matches;
    mq.addEventListener("change", (e) => {
      this.#systemDark = e.matches;
    });

    $effect.root(() => {
      $effect(() => {
        const data: Persisted = {
          showKeymap: this.showKeymap,
          glow: this.glow,
          caretStyle: this.caretStyle,
          theme: this.theme,
          drillLength: this.drillLength,
          mode: this.mode,
          currentLessonName: this.currentLessonName,
        };
        localStorage.setItem(KEY, JSON.stringify(data));
      });

      $effect(() => {
        document.documentElement.classList.toggle("dark", this.resolvedDark);
      });
    });
  }
}

export const settings = new Settings();
