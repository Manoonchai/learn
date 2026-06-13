<script lang="ts">
  import type { LayoutKey } from "$lib/engine";

  let {
    keyData,
    nextChar,
    glow,
  }: { keyData: LayoutKey; nextChar: string; glow: boolean } = $props();

  const activeBase = $derived(nextChar !== "" && nextChar === keyData.base);
  const activeShift = $derived(nextChar !== "" && nextChar === keyData.shift);
</script>

<div
  class="key relative grid aspect-square w-full place-items-center rounded-md border text-center transition-[background-color,border-color,box-shadow,transform] duration-150
    {activeBase
    ? `border-primary bg-primary/12 -translate-y-px ${glow ? 'glow-primary' : ''}`
    : activeShift
      ? `border-accent bg-accent/12 -translate-y-px ${glow ? 'glow-accent' : ''}`
      : 'border-border bg-panel'}"
  data-code={keyData.code}
  data-active={activeBase || activeShift ? "true" : undefined}
>
  {#if keyData.shift}
    <span
      class="absolute top-0.5 right-1 text-[0.62em] leading-none
        {activeShift ? 'text-accent' : 'text-faint'}"
    >
      {keyData.shift}
    </span>
  {/if}
  <span
    class="font-thai text-[1.05em] leading-none
      {activeBase ? 'text-primary' : activeShift ? 'text-faint' : 'text-ink'}"
  >
    {keyData.base}
  </span>
  {#if keyData.home}
    <span
      class="absolute bottom-1 left-1/2 h-0.5 w-2.5 -translate-x-1/2 rounded-full bg-primary/45"
      aria-hidden="true"
    ></span>
  {/if}
</div>
