import { browser } from "$app/environment";
import type { DrillLength } from "$lib/engine";

export type Theme = "light" | "dark" | "system";

const KEY = "learn-manoonchai:v2";

interface Persisted {
  showKeymap: boolean;
  glow: boolean;
  showAdjacentWords: boolean;
  theme: Theme;
  drillLength: DrillLength;
  currentLessonName?: string;
}

const DEFAULTS: Persisted = {
  showKeymap: true,
  glow: true,
  showAdjacentWords: true,
  theme: "system",
  drillLength: 25,
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
 * controls the redesign keeps: keymap + glow, adjacent-word hints, theme, and
 * drill length. (v1's logo / Esc / Tab toggles became fixed behaviours.)
 */
class Settings {
  showKeymap = $state(true);
  glow = $state(true);
  showAdjacentWords = $state(true);
  theme = $state<Theme>("system");
  drillLength = $state<DrillLength>(25);
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
    this.showAdjacentWords = p.showAdjacentWords;
    this.theme = p.theme;
    this.drillLength = p.drillLength;
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
          showAdjacentWords: this.showAdjacentWords,
          theme: this.theme,
          drillLength: this.drillLength,
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
