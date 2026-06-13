# Time Attack Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 60-second "Time Attack" speed run over the full Thai word set, hint-less, with a shareable result PNG for earning a Discord WPM role.

**Architecture:** Time Attack is a sibling of the existing lesson Drill (see `CONTEXT.md` + `docs/adr/0002`). It reuses the time-agnostic `StatsTracker`, the continuous-flow `TypingFlow`, and the keymap — but samples from a bundled frequency corpus instead of a lesson, stops on a clock instead of a word count, forces the next-key glow off, and adds a `consistency` metric plus a canvas-rendered share card. A persisted `mode` setting and a header segmented switch toggle between the two activities.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, TypeScript, Tailwind v4, Vitest (+ @testing-library/svelte, jsdom), Playwright e2e. Bun is the runner. No new runtime dependencies — the share image uses the Canvas 2D API directly (avoids the oklch/web-font serialization problems of html-to-image).

**Conventions to follow:**
- Run unit tests from `apps/web`: `cd apps/web && bun run test <path>` (one file) or `bun run test` (all).
- Type-check: `cd apps/web && bun run check`.
- e2e: `cd apps/web && bun run test:e2e`.
- Thai UI copy throughout (match existing components). Colors are CSS custom-property tokens: `--bg --ink --muted --accent --primary --border`.
- Commit after every task.

---

## File Structure

**Create:**
- `apps/web/src/lib/data/thai.json` — vendored manoontype corpus (`{name, leftToRight, words}`, ~1000 words).
- `apps/web/src/lib/engine/full-word-set.ts` — `fullWordSet` (layout-filtered) + `buildTimeAttack`.
- `apps/web/src/lib/engine/full-word-set.test.ts`
- `apps/web/src/lib/components/ModeSwitch.svelte` — header segmented control.
- `apps/web/src/lib/share/result-card.ts` — share payload + canvas PNG + download/copy.
- `apps/web/src/lib/share/result-card.test.ts`
- `apps/web/src/lib/components/ResultShare.svelte` — Save/Copy image buttons.
- `apps/web/e2e/time-attack.spec.ts`

**Modify:**
- `apps/web/src/lib/engine/layout.ts` — add `typeableChars` + `isTypeable`.
- `apps/web/src/lib/engine/types.ts` — add `consistency` to `DrillResult`.
- `apps/web/src/lib/engine/wpm.ts` — add `consistency()`.
- `apps/web/src/lib/engine/stats.ts` — populate `consistency` in `build()`.
- `apps/web/src/lib/engine/drill.ts` — add Time Attack constants.
- `apps/web/src/lib/engine/index.ts` — export new modules.
- `apps/web/src/lib/state/settings.svelte.ts` — add persisted `mode`.
- `apps/web/src/lib/components/LiveReadout.svelte` — optional countdown.
- `apps/web/src/lib/components/DrillSummary.svelte` — Time Attack variant (consistency + share).
- `apps/web/src/routes/+page.svelte` — mode branch, timer, refill, glow-off, hide track.

---

## Task 1: Vendor the corpus + full word set engine

**Files:**
- Create: `apps/web/src/lib/data/thai.json`
- Modify: `apps/web/src/lib/engine/layout.ts`
- Create: `apps/web/src/lib/engine/full-word-set.ts`
- Modify: `apps/web/src/lib/engine/drill.ts`
- Modify: `apps/web/src/lib/engine/index.ts`
- Test: `apps/web/src/lib/engine/full-word-set.test.ts`

- [ ] **Step 1: Vendor the corpus**

Download the Manoonchai project's word list verbatim:

```bash
cd /Users/narze/Code/github.com/manoonchai/learn
curl -sL https://raw.githubusercontent.com/Manoonchai/manoontype/master/static/languages/thai.json \
  -o apps/web/src/lib/data/thai.json
node -e 'const d=require("./apps/web/src/lib/data/thai.json");if(!Array.isArray(d.words)||d.words.length<900)throw new Error("bad corpus: "+JSON.stringify(Object.keys(d)));console.log("words:",d.words.length)'
```

Expected: `words: 1000` (or close). If the file is HTML/empty, the download failed — retry.

- [ ] **Step 2: Add layout typeability helpers**

Add to the bottom of `apps/web/src/lib/engine/layout.ts`:

```ts
/** Every character the Manoonchai layout can produce (base + shifted). */
export const typeableChars: Set<string> = new Set(
  Object.values(manoonchai as Record<string, string[]>)
    .flat()
    .filter((c) => c !== ""),
);

/** True if every character of `word` can be typed on the Manoonchai layout. */
export function isTypeable(word: string): boolean {
  for (const ch of word) {
    if (!typeableChars.has(ch)) return false;
  }
  return true;
}
```

- [ ] **Step 3: Write the full word set + builder**

Create `apps/web/src/lib/engine/full-word-set.ts`:

```ts
import thaiData from "../data/thai.json";
import { isTypeable } from "./layout";
import { buildDrill } from "./drill";

const allWords: string[] = (thaiData as { words: string[] }).words;

/**
 * The full Thai word set Time Attack samples from: the Manoonchai project's
 * frequency-ordered corpus, filtered to words that are fully typeable on the
 * layout. See docs/adr/0002 and the "Full word set" term in CONTEXT.md.
 */
export const fullWordSet: string[] = allWords.filter(isTypeable);

/** How many words filtering dropped — asserted ~0 in tests, useful when debugging. */
export const droppedWordCount = allWords.length - fullWordSet.length;

/** Sample `count` words uniformly (with replacement) from the full word set. */
export function buildTimeAttack(count: number, rng: () => number = Math.random): string[] {
  return buildDrill(fullWordSet, count, rng);
}
```

- [ ] **Step 4: Add Time Attack constants to `drill.ts`**

Append to `apps/web/src/lib/engine/drill.ts`:

```ts
/** Duration of one Time Attack run, in seconds. */
export const TIME_ATTACK_SECONDS = 60;
/** Words appended per refill so the typist never runs out of buffer. */
export const TIME_ATTACK_BATCH = 60;
/** Refill once this few words remain ahead of the caret. */
export const TIME_ATTACK_REFILL_AT = 25;
```

- [ ] **Step 5: Export new module**

In `apps/web/src/lib/engine/index.ts`, add after the `./drill` export:

```ts
export * from "./full-word-set";
```

- [ ] **Step 6: Write the failing test**

Create `apps/web/src/lib/engine/full-word-set.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isTypeable } from "./layout";
import { fullWordSet, droppedWordCount, buildTimeAttack } from "./full-word-set";

describe("fullWordSet", () => {
  it("has the bulk of the corpus", () => {
    expect(fullWordSet.length).toBeGreaterThan(900);
  });

  it("contains only layout-typeable words", () => {
    expect(fullWordSet.every(isTypeable)).toBe(true);
  });

  it("drops no typeable words from a modern frequency list", () => {
    // If this ever fails, inspect which words are untypeable before relaxing it.
    expect(droppedWordCount).toBe(0);
  });
});

describe("buildTimeAttack", () => {
  it("samples the requested count from the full set", () => {
    const words = buildTimeAttack(50, () => 0);
    expect(words).toHaveLength(50);
    // rng() === 0 always picks index 0.
    expect(new Set(words)).toEqual(new Set([fullWordSet[0]]));
  });

  it("draws from the full word set, not a lesson pool", () => {
    const seq = [0.1, 0.5, 0.9, 0.3];
    let i = 0;
    const words = buildTimeAttack(4, () => seq[i++ % seq.length]);
    expect(words.every((w) => fullWordSet.includes(w))).toBe(true);
  });
});
```

- [ ] **Step 7: Run the test**

Run: `cd apps/web && bun run test src/lib/engine/full-word-set.test.ts`
Expected: PASS (all 5). If `droppedWordCount` ≠ 0, list the dropped words with a quick node script and decide whether the layout truly cannot type them; only then relax the assertion to `toBeLessThan(5)` and note it in the test comment.

- [ ] **Step 8: Type-check + commit**

```bash
cd apps/web && bun run check
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/src/lib/data/thai.json apps/web/src/lib/engine/full-word-set.ts apps/web/src/lib/engine/full-word-set.test.ts apps/web/src/lib/engine/layout.ts apps/web/src/lib/engine/drill.ts apps/web/src/lib/engine/index.ts
git commit -m "feat(time-attack): bundle full word set and time-attack builder"
```

---

## Task 2: Consistency metric

**Files:**
- Modify: `apps/web/src/lib/engine/wpm.ts`
- Modify: `apps/web/src/lib/engine/types.ts`
- Modify: `apps/web/src/lib/engine/stats.ts`
- Test: `apps/web/src/lib/engine/wpm.test.ts`, `apps/web/src/lib/engine/stats.test.ts`

- [ ] **Step 1: Write the failing test for `consistency()`**

Append to `apps/web/src/lib/engine/wpm.test.ts` (add `consistency` to the import on line 1):

```ts
import { describe, expect, it } from "vitest";
import { wpm, consistency } from "./wpm";

describe("consistency", () => {
  it("is 0 with no samples", () => {
    expect(consistency([])).toBe(0);
  });

  it("is 0 when nothing was typed (mean 0)", () => {
    expect(consistency([0, 0, 0])).toBe(0);
  });

  it("is 100 for a perfectly flat cadence", () => {
    expect(consistency([40, 40, 40, 40])).toBe(100);
  });

  it("is 100 for a single sample (no spread to measure)", () => {
    expect(consistency([55])).toBe(100);
  });

  it("drops below 100 as the cadence varies", () => {
    const c = consistency([20, 60]); // mean 40, sd 20, cv 0.5 -> 50
    expect(c).toBeCloseTo(50, 5);
  });
});
```

(Keep the existing `wpm` tests in the file — only add the import name and this new `describe`.)

- [ ] **Step 2: Run it to verify failure**

Run: `cd apps/web && bun run test src/lib/engine/wpm.test.ts`
Expected: FAIL — `consistency is not exported` / `is not a function`.

- [ ] **Step 3: Implement `consistency()`**

Append to `apps/web/src/lib/engine/wpm.ts`:

```ts
/**
 * How even the per-second raw WPM was, as a percentage: 100 − coefficient of
 * variation (stddev ÷ mean), floored at 0. Flat cadence → 100; bursts and
 * stalls → lower. See the "Consistency" term in CONTEXT.md.
 */
export function consistency(rawPerSecond: number[]): number {
  const n = rawPerSecond.length;
  if (n === 0) return 0;
  const mean = rawPerSecond.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return 0;
  if (n < 2) return 100;
  const variance = rawPerSecond.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, (1 - cv) * 100);
}
```

- [ ] **Step 4: Run it to verify pass**

Run: `cd apps/web && bun run test src/lib/engine/wpm.test.ts`
Expected: PASS.

- [ ] **Step 5: Add `consistency` to `DrillResult`**

In `apps/web/src/lib/engine/types.ts`, inside `interface DrillResult`, add after `accuracy: number;`:

```ts
  /** Cadence evenness as a percentage (100 − CV of per-second raw WPM). */
  consistency: number;
```

- [ ] **Step 6: Write the failing test for stats wiring**

Append a test to `apps/web/src/lib/engine/stats.test.ts` (inside the existing `describe("StatsTracker", ...)`):

```ts
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
```

- [ ] **Step 7: Run it to verify failure**

Run: `cd apps/web && bun run test src/lib/engine/stats.test.ts`
Expected: FAIL — `r.consistency` is `undefined`.

- [ ] **Step 8: Wire `consistency` into `build()`**

In `apps/web/src/lib/engine/stats.ts`: change the import on line 2 to include `consistency`:

```ts
import { CHARS_PER_WORD, consistency, wpm } from "./wpm";
```

Then in `build()`, compute the samples once and add the field. Replace the `return { ... }` block so it reads:

```ts
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
    };
```

(This also removes the second `this.samples(now)` call — `samples` is now computed once.)

- [ ] **Step 9: Run all engine tests to verify pass**

Run: `cd apps/web && bun run test src/lib/engine`
Expected: PASS (existing tests unaffected — they assert specific fields and the `samples` array, neither of which changes).

- [ ] **Step 10: Type-check + commit**

```bash
cd apps/web && bun run check
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/src/lib/engine/wpm.ts apps/web/src/lib/engine/wpm.test.ts apps/web/src/lib/engine/types.ts apps/web/src/lib/engine/stats.ts apps/web/src/lib/engine/stats.test.ts
git commit -m "feat(time-attack): add consistency metric to stats"
```

---

## Task 3: Settings mode + ModeSwitch component

**Files:**
- Modify: `apps/web/src/lib/state/settings.svelte.ts`
- Create: `apps/web/src/lib/components/ModeSwitch.svelte`

- [ ] **Step 1: Add `mode` to settings**

In `apps/web/src/lib/state/settings.svelte.ts`:

(a) After the `CaretStyle` type (line ~7), add:

```ts
/** Which activity is active: lesson practice or a timed speed run. */
export type Mode = "lesson" | "timeAttack";
```

(b) In `interface Persisted`, add after `drillLength: DrillLength;`:

```ts
  mode: Mode;
```

(c) In `DEFAULTS`, add after `drillLength: 25,`:

```ts
  mode: "lesson",
```

(d) In the `Settings` class, add the rune after `drillLength`:

```ts
  mode = $state<Mode>("lesson");
```

(e) In `init()`, after `this.drillLength = p.drillLength;`:

```ts
    this.mode = p.mode;
```

(f) In the persistence `$effect`, add `mode: this.mode,` to the `data` object (after `drillLength: this.drillLength,`).

- [ ] **Step 2: Create the ModeSwitch component**

Create `apps/web/src/lib/components/ModeSwitch.svelte`:

```svelte
<script lang="ts">
  import { settings, type Mode } from "$lib/state/settings.svelte";

  let { onchange }: { onchange: (mode: Mode) => void } = $props();

  const modes: { value: Mode; label: string }[] = [
    { value: "lesson", label: "บทเรียน" },
    { value: "timeAttack", label: "จับเวลา" },
  ];
</script>

<div
  class="flex items-center gap-1 rounded-lg border border-border bg-bg p-1"
  role="group"
  aria-label="โหมด"
>
  {#each modes as m (m.value)}
    <button
      type="button"
      data-testid="mode-{m.value}"
      onclick={() => onchange(m.value)}
      aria-pressed={settings.mode === m.value}
      class="font-thai rounded-md px-3 py-1 text-sm transition-colors duration-150 {settings.mode ===
      m.value
        ? 'bg-primary text-primary-ink'
        : 'text-muted hover:text-ink'}"
    >
      {m.label}
    </button>
  {/each}
</div>
```

- [ ] **Step 3: Type-check**

Run: `cd apps/web && bun run check`
Expected: no errors (the component is not yet used; that is fine).

- [ ] **Step 4: Commit**

```bash
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/src/lib/state/settings.svelte.ts apps/web/src/lib/components/ModeSwitch.svelte
git commit -m "feat(time-attack): add persisted mode setting and ModeSwitch"
```

---

## Task 4: Live countdown in LiveReadout

**Files:**
- Modify: `apps/web/src/lib/components/LiveReadout.svelte`
- Test: `apps/web/src/lib/components/LiveReadout.test.ts`

- [ ] **Step 1: Write the failing test**

Read the existing `apps/web/src/lib/components/LiveReadout.test.ts` first to match its render helper, then append:

```ts
  it("shows a countdown when remaining is provided", () => {
    render(LiveReadout, { wpm: 40, accuracy: 98, remaining: 42 });
    expect(screen.getByTestId("countdown")).toHaveTextContent("42");
  });

  it("hides the countdown when remaining is null", () => {
    render(LiveReadout, { wpm: 40, accuracy: 98, remaining: null });
    expect(screen.queryByTestId("countdown")).toBeNull();
  });
```

(Match the existing import style for `render`/`screen` already used in that file.)

- [ ] **Step 2: Run it to verify failure**

Run: `cd apps/web && bun run test src/lib/components/LiveReadout.test.ts`
Expected: FAIL — no `countdown` testid.

- [ ] **Step 3: Add the countdown to the component**

In `apps/web/src/lib/components/LiveReadout.svelte`, extend the props:

```ts
  let {
    wpm = 0,
    accuracy = 100,
    dim = false,
    remaining = null,
  }: { wpm?: number; accuracy?: number; dim?: boolean; remaining?: number | null } = $props();
```

Then add this block as the FIRST child inside the flex container (before the wpm `<div>`):

```svelte
  {#if remaining !== null}
    <div class="flex items-baseline gap-1.5">
      <span data-testid="countdown" class="font-mono text-3xl font-semibold tabular-nums text-accent"
        >{remaining}</span
      >
      <span class="text-xs tracking-wide text-muted uppercase">s</span>
    </div>
    <div class="h-5 w-px bg-border" aria-hidden="true"></div>
  {/if}
```

- [ ] **Step 4: Run it to verify pass**

Run: `cd apps/web && bun run test src/lib/components/LiveReadout.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/src/lib/components/LiveReadout.svelte apps/web/src/lib/components/LiveReadout.test.ts
git commit -m "feat(time-attack): show countdown in live readout"
```

---

## Task 5: Share card (canvas PNG + helpers)

**Files:**
- Create: `apps/web/src/lib/share/result-card.ts`
- Test: `apps/web/src/lib/share/result-card.test.ts`
- Create: `apps/web/src/lib/components/ResultShare.svelte`

- [ ] **Step 1: Write the failing test for the pure helpers**

Create `apps/web/src/lib/share/result-card.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify failure**

Run: `cd apps/web && bun run test src/lib/share/result-card.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the share module**

Create `apps/web/src/lib/share/result-card.ts`:

```ts
import type { DrillResult } from "$lib/engine";

export interface ShareData {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  seconds: number;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
}

/** Build the rounded, formatted payload drawn onto the share card. */
export function shareData(result: DrillResult, now: Date): ShareData {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return {
    netWpm: Math.round(result.netWpm),
    rawWpm: Math.round(result.rawWpm),
    accuracy: Math.round(result.accuracy),
    consistency: Math.round(result.consistency),
    seconds: Math.round(result.seconds),
    date: `${yyyy}-${mm}-${dd}`,
  };
}

/** Download filename for a share image. */
export function shareFilename(d: ShareData): string {
  return `manoonchai-timeattack-${d.netWpm}wpm-${d.date}.png`;
}

const W = 1200;
const H = 630;

/** Read a CSS custom-property token off :root, with a fallback for SSR/tests. */
function token(name: string, fallback: string): string {
  if (typeof getComputedStyle === "undefined" || typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function drawCard(ctx: CanvasRenderingContext2D, d: ShareData): void {
  const bg = token("--bg", "#0f1210");
  const ink = token("--ink", "#e8eae6");
  const muted = token("--muted", "#9aa39a");
  const accent = token("--accent", "#7bd88f");
  const border = token("--border", "#2a2f2a");
  const font = "Sarabun, ui-sans-serif, system-ui, sans-serif";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = muted;
  ctx.font = `600 30px ${font}`;
  ctx.fillText("Learn Manoonchai · Time Attack", 72, 110);

  ctx.fillStyle = accent;
  ctx.font = `700 210px ${font}`;
  ctx.fillText(String(d.netWpm), 68, 360);

  ctx.fillStyle = muted;
  ctx.font = `500 44px ${font}`;
  ctx.fillText("net wpm", 76, 410);

  const stats: [string, string][] = [
    ["raw", String(d.rawWpm)],
    ["acc", `${d.accuracy}%`],
    ["consistency", `${d.consistency}%`],
    ["time", `${d.seconds}s`],
  ];
  const colW = (W - 144) / stats.length;
  stats.forEach(([label, value], i) => {
    const x = 72 + i * colW;
    ctx.fillStyle = ink;
    ctx.font = `700 56px ${font}`;
    ctx.fillText(value, x, 510);
    ctx.fillStyle = muted;
    ctx.font = `500 28px ${font}`;
    ctx.fillText(label, x, 552);
  });

  ctx.fillStyle = muted;
  ctx.font = `500 28px ${font}`;
  ctx.fillText(d.date, 72, H - 60);
  ctx.textAlign = "right";
  ctx.fillText("learn.manoonchai.com", W - 72, H - 60);
}

/** Render the share card to a PNG blob (browser only). */
export async function renderResultBlob(d: ShareData): Promise<Blob> {
  const dpr = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  ctx.scale(dpr, dpr);
  if (document.fonts?.ready) await document.fonts.ready;
  drawCard(ctx, d);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}

/** Trigger a browser download of `blob` as `filename`. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Copy an image blob to the clipboard. Throws if the API is unavailable. */
export async function copyBlob(blob: Blob): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("clipboard image write unsupported");
  }
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}
```

- [ ] **Step 4: Run it to verify pass**

Run: `cd apps/web && bun run test src/lib/share/result-card.test.ts`
Expected: PASS (only the pure helpers are tested; canvas/clipboard are exercised in e2e/manual).

- [ ] **Step 5: Create the ResultShare component**

Create `apps/web/src/lib/components/ResultShare.svelte`:

```svelte
<script lang="ts">
  import type { DrillResult } from "$lib/engine";
  import {
    shareData,
    shareFilename,
    renderResultBlob,
    downloadBlob,
    copyBlob,
  } from "$lib/share/result-card";

  let { result }: { result: DrillResult } = $props();

  let copied = $state(false);
  let busy = $state(false);

  async function onSave() {
    busy = true;
    try {
      const d = shareData(result, new Date());
      const blob = await renderResultBlob(d);
      downloadBlob(blob, shareFilename(d));
    } finally {
      busy = false;
    }
  }

  async function onCopy() {
    busy = true;
    try {
      const blob = await renderResultBlob(shareData(result, new Date()));
      await copyBlob(blob);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      // Clipboard image unsupported (e.g. Firefox) — fall back to download.
      const d = shareData(result, new Date());
      downloadBlob(await renderResultBlob(d), shareFilename(d));
    } finally {
      busy = false;
    }
  }
</script>

<div class="flex flex-wrap items-center justify-center gap-3">
  <button
    type="button"
    data-testid="share-save"
    onclick={onSave}
    disabled={busy}
    class="rounded-xl border border-border px-5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-border-strong hover:bg-panel disabled:opacity-50"
  >
    บันทึกรูป
  </button>
  <button
    type="button"
    data-testid="share-copy"
    onclick={onCopy}
    disabled={busy}
    class="rounded-xl border border-border px-5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-border-strong hover:bg-panel disabled:opacity-50"
  >
    {copied ? "คัดลอกแล้ว ✓" : "คัดลอกรูป"}
  </button>
</div>
```

- [ ] **Step 6: Type-check + commit**

```bash
cd apps/web && bun run check
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/src/lib/share/result-card.ts apps/web/src/lib/share/result-card.test.ts apps/web/src/lib/components/ResultShare.svelte
git commit -m "feat(time-attack): shareable result card (canvas PNG, save/copy)"
```

---

## Task 6: DrillSummary Time Attack variant

**Files:**
- Modify: `apps/web/src/lib/components/DrillSummary.svelte`

- [ ] **Step 1: Add a `timeAttack` prop and branch the content**

In `apps/web/src/lib/components/DrillSummary.svelte`:

(a) Add `ResultShare` to the imports:

```ts
  import ResultShare from "./ResultShare.svelte";
```

(b) Extend the props block:

```ts
  let {
    result,
    lessonName,
    timeAttack = false,
    onRestart,
    onChangeLesson,
  }: {
    result: DrillResult;
    lessonName: string;
    timeAttack?: boolean;
    onRestart: () => void;
    onChangeLesson: () => void;
  } = $props();
```

(c) Replace the `secondary` derived block with a mode-aware version:

```ts
  const secondary = $derived(
    timeAttack
      ? [
          { label: "raw wpm", value: result.rawWpm.toFixed(0) },
          { label: "ความแม่นยำ", value: `${result.accuracy.toFixed(0)}%` },
          { label: "ความสม่ำเสมอ", value: `${result.consistency.toFixed(0)}%` },
          { label: "เวลา", value: `${result.seconds.toFixed(0)}s` },
        ]
      : [
          { label: "raw wpm", value: result.rawWpm.toFixed(0) },
          { label: "ความแม่นยำ", value: `${result.accuracy.toFixed(0)}%` },
          { label: "ผิดพลาด", value: result.errors.toFixed(0) },
          { label: "เวลา", value: `${result.seconds.toFixed(0)}s` },
        ],
  );
```

(d) Replace the caption line (`<p class="font-thai text-sm text-muted">จบบท {lessonName}</p>`) with:

```svelte
    <p class="font-thai text-sm text-muted">
      {timeAttack ? "จับเวลา · 60 วินาที" : `จบบท ${lessonName}`}
    </p>
```

(e) Add the share buttons. After the closing `</div>` of the existing restart/change buttons block (the last `<div class="flex flex-wrap ...">`), and before `</section>`, insert:

```svelte
  {#if timeAttack}
    <div class="flex flex-col items-center gap-2">
      <p class="font-thai text-xs text-faint">บันทึกหรือคัดลอกรูปผลลัพธ์เพื่อแชร์ใน Discord</p>
      <ResultShare {result} />
    </div>
  {/if}
```

(f) In time attack the "เปลี่ยนบท" (change lesson) button is meaningless. Wrap it so it only shows in lesson mode — change the change-lesson `<button>` to:

```svelte
    {#if !timeAttack}
      <button
        type="button"
        onclick={onChangeLesson}
        class="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-border-strong hover:bg-panel"
      >
        เปลี่ยนบท
      </button>
    {/if}
```

- [ ] **Step 2: Type-check**

Run: `cd apps/web && bun run check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/src/lib/components/DrillSummary.svelte
git commit -m "feat(time-attack): consistency + share buttons in summary"
```

---

## Task 7: Wire Time Attack into the page

**Files:**
- Modify: `apps/web/src/routes/+page.svelte`

- [ ] **Step 1: Update imports + state**

In `apps/web/src/routes/+page.svelte`:

(a) Extend the engine import to add the builder + constants:

```ts
  import {
    StatsTracker,
    buildDrill,
    buildTimeAttack,
    lessonByName,
    nextKey,
    resolveKey,
    TIME_ATTACK_SECONDS,
    TIME_ATTACK_BATCH,
    TIME_ATTACK_REFILL_AT,
    type DrillResult,
  } from "$lib/engine";
```

(b) Add the ModeSwitch import (after the `LessonPicker` import):

```ts
  import ModeSwitch from "$lib/components/ModeSwitch.svelte";
  import type { Mode } from "$lib/state/settings.svelte";
```

(c) Add two state vars near the other drill state (after `let liveAcc = $state(100);`):

```ts
  let liveRemaining = $state<number | null>(null);
  let deadline = 0;
```

(d) Add a derived flag after the other deriveds (after `const lesson = $derived(...)`):

```ts
  const timeAttack = $derived(settings.mode === "timeAttack");
```

- [ ] **Step 2: Branch `newDrill()` on mode**

Replace the body of `newDrill()` so the build line and live-readout reset are mode-aware:

```ts
  function newDrill() {
    stopTick();
    drill = timeAttack ? buildTimeAttack(TIME_ATTACK_BATCH) : buildDrill(lesson.words, settings.drillLength);
    wordIdx = 0;
    input = "";
    statuses = [];
    started = false;
    finished = false;
    result = null;
    liveWpm = 0;
    liveAcc = 100;
    liveRemaining = timeAttack ? TIME_ATTACK_SECONDS : null;
    deadline = 0;
    stats = new StatsTracker();
    queueMicrotask(() => inputEl?.focus());
  }
```

- [ ] **Step 3: Set the deadline on start + drive the countdown/finish in the tick**

Replace `start()`:

```ts
  function start() {
    if (started) return;
    started = true;
    const now = performance.now();
    stats.start(now);
    if (timeAttack) deadline = now + TIME_ATTACK_SECONDS * 1000;
    startTick();
  }
```

Replace `startTick()`:

```ts
  function startTick() {
    stopTick();
    tick = setInterval(() => {
      const now = performance.now();
      const r = stats.build(now);
      liveWpm = r.netWpm;
      liveAcc = r.accuracy;
      if (timeAttack) {
        liveRemaining = Math.max(0, Math.ceil((deadline - now) / 1000));
        if (now >= deadline) finish();
      }
    }, 250);
  }
```

- [ ] **Step 4: Refill the buffer instead of finishing by count in Time Attack**

Replace `commitWord()`:

```ts
  function commitWord() {
    const correct = input === target;
    statuses[wordIdx] = correct;
    wordIdx += 1;
    input = "";
    if (timeAttack) {
      if (drill.length - wordIdx <= TIME_ATTACK_REFILL_AT) {
        drill = [...drill, ...buildTimeAttack(TIME_ATTACK_BATCH)];
      }
      return; // Time Attack ends on the clock, never on a word count.
    }
    if (wordIdx >= drill.length) finish();
  }
```

- [ ] **Step 5: Freeze the countdown at finish**

In `finish()`, add `liveRemaining = timeAttack ? 0 : null;` after `liveAcc = result.accuracy;`:

```ts
  function finish() {
    stopTick();
    result = stats.build(performance.now());
    liveWpm = result.netWpm;
    liveAcc = result.accuracy;
    liveRemaining = timeAttack ? 0 : null;
    finished = true;
  }
```

- [ ] **Step 6: Add `setMode` and render the switch in the header**

Add the handler (next to `pickLesson`):

```ts
  function setMode(mode: Mode) {
    if (settings.mode === mode) return;
    settings.mode = mode;
    newDrill();
  }
```

In the header `<div class="flex items-center gap-2">`, add `<ModeSwitch onchange={setMode} />` as the first child, and wrap the existing lesson `<button>` (the one titled "เลือกบทเรียน") so it only shows in lesson mode:

```svelte
    <div class="flex items-center gap-2">
      <ModeSwitch onchange={setMode} />
      {#if !timeAttack}
        <button
          type="button"
          onclick={() => (showLesson = true)}
          class="font-thai max-w-[42vw] truncate rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-ink sm:max-w-xs"
          title="เลือกบทเรียน"
        >
          <span class="text-faint">บท:</span>
          {lesson.name}
        </button>
      {/if}
      <ThemeToggle />
      <!-- settings button unchanged -->
```

(Leave the `<ThemeToggle />` and settings button exactly as they are after this.)

- [ ] **Step 7: Pass `timeAttack` to the summary, countdown to the readout, and force glow off + hide the track**

(a) Summary — add the prop:

```svelte
      <DrillSummary
        {result}
        {timeAttack}
        lessonName={lesson.name}
        onRestart={newDrill}
        onChangeLesson={() => (showLesson = true)}
      />
```

(b) Live readout — pass the countdown:

```svelte
      <LiveReadout wpm={liveWpm} accuracy={liveAcc} remaining={liveRemaining} dim={!started} />
```

(c) DrillTrack — only in lesson mode. Wrap it:

```svelte
        <div class="flex flex-col gap-6">
          <TypingFlow
            words={drill}
            {statuses}
            currentIdx={wordIdx}
            {input}
            caretStyle={settings.caretStyle}
          />
          {#if !timeAttack}
            <DrillTrack {statuses} currentIdx={wordIdx} total={drill.length} />
          {/if}
        </div>
```

(d) Keymap — force the glow off in Time Attack:

```svelte
      {#if settings.showKeymap}
        <Keymap {nextChar} glow={settings.glow && !timeAttack} />
      {/if}
```

- [ ] **Step 8: Type-check + run all unit tests**

Run:
```bash
cd apps/web && bun run check && bun run test
```
Expected: type-check clean, all unit tests PASS.

- [ ] **Step 9: Manual smoke test**

Run: `cd apps/web && bun run dev`, open the app.
- Click **จับเวลา** — lesson button disappears, countdown shows `60`, no progress dots.
- Type — countdown ticks down, keymap does NOT glow the next key.
- Wait for 0 (or temporarily set `TIME_ATTACK_SECONDS = 5` to speed this up, then revert) — summary shows **ความสม่ำเสมอ** + **บันทึกรูป / คัดลอกรูป**.
- Click **บันทึกรูป** — a PNG downloads with the WPM and date.
- Switch back to **บทเรียน** — lesson flow unchanged (progress dots, glow on).

- [ ] **Step 10: Commit**

```bash
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/src/routes/+page.svelte
git commit -m "feat(time-attack): wire mode switch, 60s timer, refill, hint-less keymap"
```

---

## Task 8: e2e coverage

**Files:**
- Create: `apps/web/e2e/time-attack.spec.ts`

- [ ] **Step 1: Write the e2e test**

Create `apps/web/e2e/time-attack.spec.ts`. It boots straight into Time Attack via localStorage, types a few characters on real key codes (any layout key produces input; correctness is irrelevant to the timer), and asserts the timed flow:

```ts
import { expect, test, type Page } from "@playwright/test";

async function bootTimeAttack(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "learn-manoonchai:v2",
      JSON.stringify({ theme: "dark", mode: "timeAttack" }),
    );
  });
  await page.goto("/");
  await page.getByTestId("typing-input").focus();
}

test("Time Attack shows a countdown and no progress track", async ({ page }) => {
  await bootTimeAttack(page);

  // The mode switch reflects Time Attack.
  await expect(page.getByTestId("mode-timeAttack")).toHaveAttribute("aria-pressed", "true");
  // Countdown is visible; the lesson progress track is not.
  await expect(page.getByTestId("countdown")).toBeVisible();
  await expect(page.getByTestId("progress")).toHaveCount(0);

  // Typing starts the clock: countdown drops below 60.
  await page.keyboard.press("KeyF");
  await page.keyboard.press("KeyG");
  await expect
    .poll(async () => Number(await page.getByTestId("countdown").textContent()))
    .toBeLessThan(60);
});

test("Time Attack finishes on the clock and offers a share image", async ({ page }) => {
  await bootTimeAttack(page);
  await page.keyboard.press("KeyF"); // start the clock

  // Wait out the 60s run (Playwright default timeout is raised for this assertion).
  await expect(page.getByTestId("summary")).toBeVisible({ timeout: 65_000 });
  await expect(page.getByTestId("share-save")).toBeVisible();
  await expect(page.getByTestId("share-copy")).toBeVisible();

  // Saving produces a .png download.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("share-save").click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^manoonchai-timeattack-\d+wpm-.+\.png$/);
});
```

- [ ] **Step 2: Run the e2e suite**

Run: `cd apps/web && bun run test:e2e`
Expected: PASS. The second test takes ~60s by design. If the 65s timeout is flaky on CI, that is acceptable for a local proof; do not shorten the production `TIME_ATTACK_SECONDS`.

- [ ] **Step 3: Commit**

```bash
cd /Users/narze/Code/github.com/manoonchai/learn
git add apps/web/e2e/time-attack.spec.ts
git commit -m "test(time-attack): e2e countdown, clock finish, and share download"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full check**

```bash
cd apps/web && bun run check && bun run test && bun run test:e2e
```
Expected: type-check clean, all unit tests PASS, all e2e PASS.

- [ ] **Step 2: Confirm docs match the build**

Re-read `CONTEXT.md` (Time Attack / Full word set / Consistency) and `docs/adr/0002-time-attack-server-internal-proof.md`. The build must match: hint-less (glow forced off), 60s fixed, manoontype wordset, client-PNG proof. If anything diverged during implementation, fix the code (not the ADR) — or, if the divergence was deliberate, update the ADR in its own commit.

- [ ] **Step 3: Final commit (if any doc tweaks)**

```bash
cd /Users/narze/Code/github.com/manoonchai/learn
git add -A && git commit -m "docs(time-attack): reconcile CONTEXT/ADR with implementation" || echo "nothing to commit"
```

---

## Self-Review Notes

- **Spec coverage:** full word set (T1), 60s timer (T7), consistency (T2), hint-less keymap (T7), share PNG (T5), mode switch (T3/T7), ADR/CONTEXT terms already written → all covered.
- **Type consistency:** `buildTimeAttack(count, rng)`, `consistency(number[])`, `DrillResult.consistency`, `shareData(result, Date)`, `Mode = "lesson" | "timeAttack"`, `ModeSwitch onchange(mode)` — names used identically across tasks.
- **Reused as-is:** `StatsTracker` (time-agnostic), `TypingFlow` (windowed scroll), `resolveKey`, `buildDrill` (delegated to by `buildTimeAttack`).
