<script lang="ts">
  import type { WordStat } from "$lib/engine";
  import { bucketOf, speedThresholds } from "$lib/engine";

  let { words }: { words: WordStat[] } = $props();

  // Slowest → fastest. Errors override to danger + underline.
  const BUCKET_CLASS = ["text-faint", "text-muted", "text-ink", "text-primary", "text-accent"];
  const ERROR_CLASS = "text-danger underline decoration-danger decoration-2 underline-offset-4";

  const thresholds = $derived(speedThresholds(words));

  function wordClass(w: WordStat): string {
    if (!w.correct) return ERROR_CLASS;
    return BUCKET_CLASS[bucketOf(w.wpm, thresholds)] ?? "text-ink";
  }

  const legend = $derived.by(() => {
    if (thresholds.length === 0) return [];
    const round = (n: number) => Math.round(n);
    return BUCKET_CLASS.map((cls, i) => {
      let label: string;
      if (i === 0) label = `<${round(thresholds[0])}`;
      else if (i === thresholds.length) label = `${round(thresholds[i - 1])}+`;
      else label = `${round(thresholds[i - 1])}–${round(thresholds[i])}`;
      return { cls, label };
    });
  });
</script>

{#if words.length}
  <div data-testid="input-history" class="flex w-full flex-col gap-2">
    <div class="flex items-center justify-between gap-3">
      <span class="font-thai text-xs text-muted">ประวัติการพิมพ์</span>
      {#if legend.length}
        <div class="flex flex-wrap items-center gap-2" aria-hidden="true">
          {#each legend as l (l.label)}
            <span class="font-mono text-[0.65rem] tabular-nums {l.cls}">{l.label}</span>
          {/each}
        </div>
      {/if}
    </div>
    <div class="font-thai flex flex-wrap gap-x-1 gap-y-0.5 text-lg leading-relaxed">
      {#each words as w, i (i)}
        <span class={wordClass(w)}>{w.text}</span>
      {/each}
    </div>
  </div>
{/if}
