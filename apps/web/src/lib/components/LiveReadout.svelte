<script lang="ts">
  let {
    wpm = 0,
    accuracy = 100,
    dim = false,
    remaining = null,
  }: { wpm?: number; accuracy?: number; dim?: boolean; remaining?: number | null } = $props();
</script>

<div
  class="flex items-baseline justify-center gap-8 transition-opacity duration-300 {dim
    ? 'opacity-45'
    : ''}"
>
  {#if remaining !== null}
    <div class="flex items-baseline gap-1.5">
      <span data-testid="countdown" class="font-mono text-3xl font-semibold tabular-nums text-accent"
        >{remaining}</span
      >
      <span class="text-xs tracking-wide text-muted uppercase">s</span>
    </div>
    <div class="h-5 w-px bg-border" aria-hidden="true"></div>
  {/if}
  <div class="flex items-baseline gap-1.5">
    <span class="font-mono text-3xl font-semibold tabular-nums text-ink">{wpm.toFixed(0)}</span>
    <span class="text-xs tracking-wide text-muted uppercase">wpm</span>
  </div>
  <div class="h-5 w-px bg-border" aria-hidden="true"></div>
  <div class="flex items-baseline gap-1.5">
    <span class="font-mono text-3xl font-semibold tabular-nums text-ink">{accuracy.toFixed(0)}<span class="text-lg text-muted">%</span></span>
    <span class="text-xs tracking-wide text-muted uppercase">acc</span>
  </div>
</div>
