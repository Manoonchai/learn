<script lang="ts">
  let {
    statuses = [],
    currentIdx = 0,
    total = 0,
  }: { statuses?: (boolean | null)[]; currentIdx?: number; total?: number } = $props();
</script>

<div class="flex w-full items-center gap-3">
  <div class="flex min-w-0 flex-1 flex-wrap gap-1" role="presentation">
    {#each { length: total } as _, i (i)}
      {@const done = statuses[i]}
      <span
        class="h-1.5 flex-1 rounded-full transition-colors duration-200 {i === currentIdx
          ? 'min-w-3 bg-primary'
          : done === true
            ? 'bg-primary/45'
            : done === false
              ? 'bg-danger/70'
              : 'bg-border'}"
        style="min-width: 0.4rem"
      ></span>
    {/each}
  </div>
  <span data-testid="progress" class="font-mono shrink-0 text-xs tabular-nums text-muted">
    {Math.min(currentIdx, total)}<span class="text-faint">/{total}</span>
  </span>
</div>
