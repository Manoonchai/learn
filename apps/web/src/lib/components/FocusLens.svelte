<script lang="ts">
  let {
    prevWord = "",
    target = "",
    input = "",
    nextWord = "",
    showAdjacent = true,
  }: {
    prevWord?: string;
    target?: string;
    input?: string;
    nextWord?: string;
    showAdjacent?: boolean;
  } = $props();

  // Thai tone marks and above/below vowels are combining: they must stay in the
  // same text run as their base consonant or they render on a dotted circle.
  // So we colour per *grapheme cluster*, never per code point.
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

  type State = "pending" | "active" | "correct" | "wrong";
  const cells = $derived.by<{ seg: string; state: State }[]>(() => {
    const out: { seg: string; state: State }[] = [];
    for (const c of clustersOf(target)) {
      const len = c.end - c.start;
      const typed = Math.min(Math.max(input.length - c.start, 0), len);
      let state: State;
      if (typed === 0) state = "pending";
      else {
        const ok = input.slice(c.start, c.start + typed) === target.slice(c.start, c.start + typed);
        state = !ok ? "wrong" : typed === len ? "correct" : "active";
      }
      out.push({ seg: c.seg, state });
    }
    // Characters typed past the end of the word are surplus errors.
    if (input.length > target.length) {
      out.push({ seg: input.slice(target.length), state: "wrong" });
    }
    return out;
  });

  // Caret sits after every cluster already entered (cluster.start < input.length).
  const caretAfter = $derived(
    clustersOf(target).filter((c) => c.start < input.length).length,
  );
  const fontSize = "clamp(2.75rem, 9vw, 5rem)";
</script>

<div class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
  <div class="min-w-0 justify-self-end text-right">
    {#if showAdjacent && prevWord}
      <span class="font-thai block truncate text-2xl text-faint sm:text-3xl">{prevWord}</span>
    {/if}
  </div>

  <div
    data-testid="current-word"
    class="font-thai relative flex items-center justify-center py-2 text-center leading-[1.5]"
  >{#each cells as cell, i (i)}{#if i === caretAfter}<span class="caret animate-cursor" aria-hidden="true"></span>{/if}<span
        class={cell.state === "wrong"
          ? "text-danger underline decoration-danger decoration-2 underline-offset-4"
          : cell.state === "pending"
            ? "text-muted"
            : "text-ink"}
        style="font-size: {fontSize}">{cell.seg}</span
      >{/each}{#if caretAfter >= cells.length}<span class="caret animate-cursor" aria-hidden="true"></span>{/if}{#if cells.length === 0}<span class="invisible" style="font-size: {fontSize}">ก</span>{/if}</div>

  <div class="min-w-0 justify-self-start text-left">
    {#if showAdjacent && nextWord}
      <span class="font-thai block truncate text-2xl text-faint sm:text-3xl">{nextWord}</span>
    {/if}
  </div>
</div>

<style>
  .caret {
    display: inline-block;
    width: 3px;
    height: clamp(2.5rem, 8vw, 4.4rem);
    margin: 0 1px;
    border-radius: 9999px;
    background-color: var(--primary);
    align-self: center;
  }
</style>
