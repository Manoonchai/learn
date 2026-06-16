<script lang="ts">
  import type { CaretStyle } from "$lib/state/settings.svelte";

  let {
    words = [],
    statuses = [],
    currentIdx = 0,
    input = "",
    caretStyle = "line",
  }: {
    words?: string[];
    statuses?: (boolean | null)[];
    currentIdx?: number;
    input?: string;
    caretStyle?: CaretStyle;
  } = $props();

  // Committed and upcoming words colour uniformly (one whole-word verdict), so we
  // split them per *grapheme cluster* — a combining mark always rides with its base
  // in one text run, never landing on a dotted circle. The active word is different:
  // it needs per-keystroke feedback, so it splits per code point instead (see below).
  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter("th", { granularity: "grapheme" })
      : null;

  function clustersOf(str: string): { seg: string; start: number; end: number }[] {
    if (!str) return [];
    if (segmenter) {
      const out: { seg: string; start: number; end: number }[] = [];
      for (const { segment, index } of segmenter.segment(str)) {
        out.push({ seg: segment, start: index, end: index + segment.length });
      }
      return out;
    }
    // Fallback: one code point per cell (combining may not attach).
    const out: { seg: string; start: number; end: number }[] = [];
    let i = 0;
    for (const ch of str) {
      out.push({ seg: ch, start: i, end: i + ch.length });
      i += ch.length;
    }
    return out;
  }

  type Cell = { seg: string; cls: string };

  const PENDING = "text-faint";
  const CURRENT_PENDING = "text-muted";
  const CORRECT = "text-ink";
  const WRONG = "text-danger underline decoration-danger decoration-2 underline-offset-4";

  // Committed and upcoming words only carry a whole-word verdict (the per-word
  // status the drill records), so they colour uniformly; the active word is the
  // only one with live per-cluster feedback.
  function staticCells(word: string, done: boolean, correct: boolean): Cell[] {
    const cls = !done ? PENDING : correct ? CORRECT : WRONG;
    return clustersOf(word).map((c) => ({ seg: c.seg, cls }));
  }

  const target = $derived(words[currentIdx] ?? "");

  // The active word colours one cell per *code point*, exactly like manoontype: each
  // code point lights the instant it is typed — correct (ink), wrong (danger), or
  // still pending (muted) — and the caret sits between code points. Thai combining
  // marks (tone marks, above/below vowels) are their own cells, yet because every
  // cell stays `display: inline` the Boon font shapes the whole word as one run and
  // positions each mark onto its base via GPOS. So a mark stacks above its base even
  // when the two carry different colours (ที่, not ที), and a mark only lights once
  // *its own* keystroke lands — pressing a base never lights its vowel early.
  const activeCells = $derived.by<Cell[]>(() => {
    const out: Cell[] = [];
    const inLen = input.length;
    let i = 0;
    for (const ch of target) {
      const end = i + ch.length;
      let cls: string;
      if (i >= inLen) cls = CURRENT_PENDING; // not reached yet
      else if (input.slice(i, end) === ch) cls = CORRECT; // typed, matches
      else cls = WRONG; // typed, but the wrong key (the expected char is shown)
      out.push({ seg: ch, cls });
      i = end;
    }
    // Keystrokes past the end of the word are surplus errors (the typed text shows).
    if (inLen > target.length) {
      out.push({ seg: input.slice(target.length), cls: WRONG });
    }
    return out;
  });

  // Caret sits before the first code point not yet typed (or at the word's end).
  const caretAfter = $derived(Math.min(input.length, activeCells.length));

  // --- Caret geometry (measured from the DOM so it glides between positions) ---
  let viewportEl = $state<HTMLDivElement>();
  let wrapperEl = $state<HTMLDivElement>();
  let currentWordEl = $state<HTMLElement>();
  let activeEls = $state<HTMLElement[]>([]);
  let endEl = $state<HTMLElement>();

  let caretCss = $state("");
  let measured = $state(false);
  let scrollY = $state(0);

  const MAX_LINES = 3;
  const LINE_HEIGHT = 1.8;
  const IDLE_MS = 1000;

  const raf =
    typeof requestAnimationFrame !== "undefined"
      ? requestAnimationFrame
      : (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0);

  function measure() {
    if (!wrapperEl || caretStyle === "off") return;
    const wrap = wrapperEl.getBoundingClientRect();

    // Horizontal anchor: the cell the caret sits before, or the word-end marker.
    let rect: DOMRect | undefined;
    let atEnd = false;
    const next = activeEls[caretAfter];
    if (caretAfter < activeCells.length && next) {
      rect = next.getBoundingClientRect();
    } else if (endEl) {
      rect = endEl.getBoundingClientRect();
      atEnd = true;
    }
    if (!rect) return;

    // Vertical anchor: the whole active-word box, which always spans the full glyph
    // height on a single line. An individual cell won't do — one holding only an
    // above/below combining mark (e.g. ิ, ุ) collapses to the mark's height and
    // would shrink the caret; the word box stays full height.
    const wordRect = currentWordEl?.getBoundingClientRect();
    const vrect = wordRect && wordRect.height ? wordRect : rect;
    const h = vrect.height || 0;
    const left = rect.left - wrap.left;
    const centerY = vrect.top + vrect.height / 2 - wrap.top;
    // Width matters only for block/underline; floor it so a zero-width combining
    // cell still yields a visible box.
    const w = atEnd || rect.width <= 1 ? Math.max(h * 0.5, 4) : rect.width;

    let top: number;
    let boxW: number;
    let boxH: number;
    if (caretStyle === "underline") {
      boxW = w;
      boxH = 3;
      top = centerY + h / 2 - 3;
    } else if (caretStyle === "block") {
      boxW = w;
      boxH = h;
      top = centerY - h / 2;
    } else {
      boxW = 3;
      boxH = h;
      top = centerY - h / 2;
    }

    caretCss = `width:${boxW}px;height:${boxH}px;transform:translate(${left}px,${top}px)`;
    measured = true;
    updateScroll(centerY);
  }

  // Windowed scroll: keep the caret's line in view, with one line of lead-in
  // above it where possible (Monkeytype-style line follow).
  function updateScroll(centerY: number) {
    if (!viewportEl || !wrapperEl) return;
    const cs = getComputedStyle(viewportEl);
    let lh = parseFloat(cs.lineHeight);
    if (!lh || Number.isNaN(lh)) lh = parseFloat(cs.fontSize || "16") * LINE_HEIGHT;
    if (!lh) return;

    const line = Math.max(0, Math.round((centerY - lh / 2) / lh));
    const contentH = wrapperEl.offsetHeight;
    const maxScroll = Math.max(0, contentH - viewportEl.clientHeight);
    scrollY = Math.min(Math.max(0, (line - 1) * lh), maxScroll);
  }

  function requestMeasure() {
    raf(() => measure());
  }

  // Re-measure whenever the typed text, the active word, the word list, or the
  // caret shape changes — that is whenever the caret should move or resize.
  $effect(() => {
    // Touch the reactive inputs so the effect re-runs on any of them.
    void input;
    void currentIdx;
    void words.length;
    void caretStyle;
    void activeCells.length;
    requestMeasure();
  });

  // One-time wiring: reflow (resize / rewrap) and webfont load shift glyph
  // metrics, so re-measure on both.
  $effect(() => {
    requestMeasure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => requestMeasure()) : null;
    if (ro && wrapperEl) ro.observe(wrapperEl);
    if (ro && viewportEl) ro.observe(viewportEl);
    const onResize = () => requestMeasure();
    if (typeof window !== "undefined") window.addEventListener("resize", onResize);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => requestMeasure());
    }
    return () => {
      ro?.disconnect();
      if (typeof window !== "undefined") window.removeEventListener("resize", onResize);
    };
  });

  // --- Idle blink: solid while typing, blink again after a short pause ---
  let idle = $state(true);
  let lastSig = "";
  let primed = false;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const sig = `${currentIdx}:${input}`;
    if (!primed) {
      primed = true;
      lastSig = sig;
      return;
    }
    if (sig === lastSig) return;
    lastSig = sig;
    idle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => (idle = true), IDLE_MS);
  });

  $effect(() => () => clearTimeout(idleTimer));
</script>

<div
  bind:this={viewportEl}
  data-testid="typing-flow"
  class="font-thai relative w-full select-none overflow-hidden text-center leading-[1.8]"
  style="height: {MAX_LINES * LINE_HEIGHT}em; font-size: clamp(1.5rem, 4.5vw, 2.25rem)"
  role="presentation"
>
  <div
    bind:this={wrapperEl}
    class="caret-scroll relative"
    style="transform: translateY(-{scrollY}px)"
  >
    {#if caretStyle !== "off"}
      <span
        class="caret caret-{caretStyle} {idle ? 'blinking' : ''}"
        class:invisible={!measured}
        style={caretCss}
        aria-hidden="true"
      ></span>
    {/if}

    {#each words as word, wi (wi)}
      {#if wi === currentIdx}<span bind:this={currentWordEl} data-testid="current-word" class="word"
          >{#each activeCells as cell, i (i)}<span bind:this={activeEls[i]} class={cell.cls}
              >{cell.seg}</span
            >{/each}<span bind:this={endEl} class="caret-end" aria-hidden="true"></span></span
        >{:else}{@const correct = statuses[wi] === true}<span class="word"
          >{#each staticCells(word, wi < currentIdx, correct) as cell, i (i)}<span class={cell.cls}
              >{cell.seg}</span
            >{/each}</span
        >{/if}{" "}
    {/each}
  </div>
</div>

<style>
  .caret-scroll {
    transition: transform 0.2s var(--ease-out-quint);
  }

  .word {
    display: inline-block;
    position: relative;
    z-index: 1;
    /* Thai has no inter-word spaces, so a bare " " reads as one word. Add a
       little breathing room between tokens. */
    margin-inline: 0.14em;
  }

  .caret-end {
    display: inline-block;
    width: 0;
  }

  .caret {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    border-radius: 9999px;
    background-color: var(--primary);
    transition:
      transform 0.11s var(--ease-out-quint),
      width 0.11s var(--ease-out-quint),
      height 0.11s var(--ease-out-quint);
    will-change: transform;
  }

  .caret-block {
    border-radius: 0.2rem;
    /* Translucent so the glyph stays legible above the box. */
    background-color: color-mix(in oklab, var(--primary) 28%, transparent);
  }

  .caret-underline {
    border-radius: 9999px;
  }

  @keyframes caret-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
  .caret.blinking {
    animation: caret-blink 1s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .caret {
      animation: none !important;
      opacity: 1 !important;
    }
  }
</style>
