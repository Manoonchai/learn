<script lang="ts">
  import type { CaretStyle } from "$lib/state/settings.svelte"

  let {
    words = [],
    statuses = [],
    currentIdx = 0,
    input = "",
    caretStyle = "line",
  }: {
    words?: string[]
    statuses?: (boolean | null)[]
    currentIdx?: number
    input?: string
    caretStyle?: CaretStyle
  } = $props()

  // Every word renders one `.letter` box per *code point* (`display: inline-block`),
  // and the active word colours each box independently — per code point, manoontype
  // style. Two Thai shaping facts drive the box-per-code-point choice:
  //   1. A combining mark in its OWN box paints in its own colour; an inline mark would
  //      inherit its base's colour instead, so a wrong vowel could never show red.
  //      Independent boxes → honest per-letter colour and live per-keystroke feedback.
  //   2. Tone marks (`.tone`, ่ ้ ๊ ๋ ์) need a box to take translateY, which lifts them
  //      clear of the above-vowel they would otherwise collide with (สิ้น, ที่ in
  //      Sarabun). See the style block + TONE_RE below.
  type Cell = { seg: string; cls: string }

  const PENDING = "text-faint"
  const CURRENT_PENDING = "text-muted"
  const CORRECT = "text-ink"
  const WRONG =
    "text-danger underline decoration-danger decoration-2 underline-offset-4"

  // Thai tone marks + thanthakhat (่ ้ ๊ ๋ ์). These stack above an above-vowel and, in
  // a single run, pack tight onto it (สิ้น, ที่ collide). They get the `.tone` class,
  // which the style block lifts with translateY so they clear the vowel below.
  const TONE_RE = /[่-์]/ // ่ ้ ๊ ๋ ์
  function letterCls(seg: string, cls: string): string {
    return TONE_RE.test(seg) ? `letter tone ${cls}` : `letter ${cls}`
  }

  // Committed and upcoming words only carry a whole-word verdict (the per-word status
  // the drill records), so every code point colours uniformly. One `.letter` box each,
  // same as the active word.
  function staticCells(word: string, done: boolean, correct: boolean): Cell[] {
    const cls = !done ? PENDING : correct ? CORRECT : WRONG
    return [...word].map((seg) => ({ seg, cls }))
  }

  const target = $derived(words[currentIdx] ?? "")

  // The active word colours one cell per *code point*, each independently (manoontype
  // style): a code point lights CORRECT the instant it is typed, reds out the instant
  // it is mistyped, and stays muted until reached. Each `.letter` is its own box, so a
  // mark shows its own colour rather than inheriting its base's (a wrong vowel reds).
  const activeCells = $derived.by<Cell[]>(() => {
    const out: Cell[] = []
    let i = 0 // UTF-16 index into target; Thai code points are all single units
    for (const ch of target) {
      const end = i + ch.length
      let cls: string
      if (input.length <= i)
        cls = CURRENT_PENDING // not reached yet
      else if (input.slice(i, end) === ch)
        cls = CORRECT // typed correctly
      else cls = WRONG // mistyped
      out.push({ seg: ch, cls })
      i = end
    }
    // Keystrokes past the end of the word are surplus errors.
    if (input.length > target.length) {
      out.push({ seg: input.slice(target.length), cls: WRONG })
    }
    return out
  })

  // Caret sits before the first code point not yet typed (or at the word's end).
  const caretAfter = $derived(Math.min(input.length, activeCells.length))

  // --- Caret geometry (measured from the DOM so it glides between positions) ---
  let viewportEl = $state<HTMLDivElement>()
  let wrapperEl = $state<HTMLDivElement>()
  let currentWordEl = $state<HTMLElement>()
  let activeEls = $state<HTMLElement[]>([])
  let endEl = $state<HTMLElement>()

  let caretCss = $state("")
  let measured = $state(false)
  let scrollY = $state(0)

  const MAX_LINES = 3
  const LINE_HEIGHT = 1.8
  const IDLE_MS = 1000

  const raf =
    typeof requestAnimationFrame !== "undefined"
      ? requestAnimationFrame
      : (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0)

  function measure() {
    if (!wrapperEl || caretStyle === "off") return
    const wrap = wrapperEl.getBoundingClientRect()

    // Horizontal anchor: the cell the caret sits before, or the word-end marker.
    let rect: DOMRect | undefined
    let atEnd = false
    const next = activeEls[caretAfter]
    if (caretAfter < activeCells.length && next) {
      rect = next.getBoundingClientRect()
    } else if (endEl) {
      rect = endEl.getBoundingClientRect()
      atEnd = true
    }
    if (!rect) return

    // Vertical anchor: the whole active-word box, which always spans the full glyph
    // height on a single line. An individual cell won't do — one holding only an
    // above/below combining mark (e.g. ิ, ุ) collapses to the mark's height and
    // would shrink the caret; the word box stays full height.
    const wordRect = currentWordEl?.getBoundingClientRect()
    const vrect = wordRect && wordRect.height ? wordRect : rect
    const h = vrect.height || 0
    const left = rect.left - wrap.left
    const centerY = vrect.top + vrect.height / 2 - wrap.top
    // Width matters only for block/underline; floor it so a zero-width combining
    // cell still yields a visible box.
    const w = atEnd || rect.width <= 1 ? Math.max(h * 0.5, 4) : rect.width

    let top: number
    let boxW: number
    let boxH: number
    if (caretStyle === "underline") {
      boxW = w
      boxH = 3
      top = centerY + h / 2 - 3
    } else if (caretStyle === "block") {
      boxW = w
      boxH = h
      top = centerY - h / 2
    } else {
      boxW = 3
      boxH = h
      top = centerY - h / 2
    }

    caretCss = `width:${boxW}px;height:${boxH}px;transform:translate(${left}px,${top}px)`
    measured = true
    updateScroll(centerY)
  }

  // Windowed scroll: keep the caret's line in view, with one line of lead-in
  // above it where possible (Monkeytype-style line follow).
  function updateScroll(centerY: number) {
    if (!viewportEl || !wrapperEl) return
    const cs = getComputedStyle(viewportEl)
    let lh = parseFloat(cs.lineHeight)
    if (!lh || Number.isNaN(lh))
      lh = parseFloat(cs.fontSize || "16") * LINE_HEIGHT
    if (!lh) return

    const line = Math.max(0, Math.round((centerY - lh / 2) / lh))
    const contentH = wrapperEl.offsetHeight
    const maxScroll = Math.max(0, contentH - viewportEl.clientHeight)
    scrollY = Math.min(Math.max(0, (line - 1) * lh), maxScroll)
  }

  function requestMeasure() {
    raf(() => measure())
  }

  // Re-measure whenever the typed text, the active word, the word list, or the
  // caret shape changes — that is whenever the caret should move or resize.
  $effect(() => {
    // Touch the reactive inputs so the effect re-runs on any of them.
    void input
    void currentIdx
    void words.length
    void caretStyle
    void activeCells.length
    requestMeasure()
  })

  // One-time wiring: reflow (resize / rewrap) and webfont load shift glyph
  // metrics, so re-measure on both.
  $effect(() => {
    requestMeasure()
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => requestMeasure())
        : null
    if (ro && wrapperEl) ro.observe(wrapperEl)
    if (ro && viewportEl) ro.observe(viewportEl)
    const onResize = () => requestMeasure()
    if (typeof window !== "undefined")
      window.addEventListener("resize", onResize)
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => requestMeasure())
    }
    return () => {
      ro?.disconnect()
      if (typeof window !== "undefined")
        window.removeEventListener("resize", onResize)
    }
  })

  // --- Idle blink: solid while typing, blink again after a short pause ---
  let idle = $state(true)
  let lastSig = ""
  let primed = false
  let idleTimer: ReturnType<typeof setTimeout> | undefined

  $effect(() => {
    const sig = `${currentIdx}:${input}`
    if (!primed) {
      primed = true
      lastSig = sig
      return
    }
    if (sig === lastSig) return
    lastSig = sig
    idle = false
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => (idle = true), IDLE_MS)
  })

  $effect(() => () => clearTimeout(idleTimer))
</script>

<div
  bind:this={viewportEl}
  data-testid="typing-flow"
  class="font-thai relative w-full select-none overflow-hidden text-center leading-[1.8]"
  style="height: {MAX_LINES *
    LINE_HEIGHT}em; font-size: clamp(1.5rem, 4.5vw, 2.25rem)"
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
      {#if wi === currentIdx}<span
          bind:this={currentWordEl}
          data-testid="current-word"
          class="word"
          >{#each activeCells as cell, i (i)}<span
              bind:this={activeEls[i]}
              class={letterCls(cell.seg, cell.cls)}>{cell.seg}</span
            >{/each}<span bind:this={endEl} class="caret-end" aria-hidden="true"
          ></span></span
        >{:else}{@const correct = statuses[wi] === true}<span class="word"
          >{#each staticCells(word, wi < currentIdx, correct) as cell, i (i)}<span
              class={letterCls(cell.seg, cell.cls)}>{cell.seg}</span
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
    /* A tone mark is inline-block (below); keep a word from breaking at one. */
    white-space: nowrap;
  }

  /* One inline-block box per code point. Each box paints in its OWN colour — an inline
     combining mark instead inherits its base's colour, which defeats per-letter
     highlighting (a wrong vowel could never show red). The mark glyphs are zero-width
     and overflow back onto their base, so they still attach; there is no whitespace
     between letter spans in the markup, so no inter-letter gap; `.word` is
     `white-space: nowrap` so a word never breaks between boxes. */
  .letter {
    display: inline-block;
  }

  /* Tone marks (่ ้ ๊ ๋ ์) sit above an above-vowel and, in a single run, pack tight
     onto it (สิ้น, ที่ collide in Sarabun). In their own box they can't stack tight;
     translateY lifts them clear of the vowel below. (transform needs the inline-block
     from .letter above — it has no effect on an inline box.) */
  .letter.tone {
    transform: translateY(-0.3em);
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
