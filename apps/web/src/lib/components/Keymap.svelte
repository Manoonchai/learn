<script lang="ts">
  import { LAYOUT_ROWS, isShifted } from "$lib/engine";
  import Key from "./Key.svelte";

  let { nextChar, glow }: { nextChar: string; glow: boolean } = $props();

  const shiftActive = $derived(isShifted(nextChar));
  const spaceActive = $derived(nextChar === " ");
</script>

<div class="keymap mx-auto w-full max-w-2xl select-none" aria-hidden="true">
  <!-- Letter rows, staggered like a physical board. -->
  <div class="flex flex-col gap-[var(--g)]">
    {#each LAYOUT_ROWS as row, r (r)}
      <div
        class="flex gap-[var(--g)]"
        style={r === 1 ? "padding-left: calc(var(--u) * 0.5)" : ""}
      >
        {#if r === 2}
          <div
            class="key-cap grid place-items-center rounded-md border text-[0.62em] font-medium tracking-wide transition-colors duration-150
              {shiftActive ? 'border-accent bg-accent/12 text-accent' : 'border-border bg-panel text-faint'}"
            style="width: calc(var(--u) * 1.6); font-size: calc(var(--u) * 0.42)"
          >
            <span style="font-size: 0.62em">SHIFT</span>
          </div>
        {/if}
        {#each row as key (key.code)}
          <div class="key-slot" style="width: var(--u); font-size: calc(var(--u) * 0.46)">
            <Key keyData={key} {nextChar} {glow} />
          </div>
        {/each}
        {#if r === 2}
          <div
            class="key-cap grid place-items-center rounded-md border text-[0.62em] font-medium tracking-wide transition-colors duration-150
              {shiftActive ? 'border-accent bg-accent/12 text-accent' : 'border-border bg-panel text-faint'}"
            style="width: calc(var(--u) * 1.6); font-size: calc(var(--u) * 0.42)"
          >
            <span style="font-size: 0.62em">SHIFT</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Spacebar -->
  <div class="mt-[var(--g)] flex justify-center">
    <div
      class="grid h-[calc(var(--u)*0.72)] place-items-center rounded-md border transition-[background-color,border-color,box-shadow] duration-150
        {spaceActive
        ? `border-primary bg-primary/12 ${glow ? 'glow-primary' : ''}`
        : 'border-border bg-panel'}"
      style="width: calc(var(--u) * 7)"
    >
      <span class="text-[0.62rem] tracking-[0.3em] {spaceActive ? 'text-primary' : 'text-faint'}">
        SPACE
      </span>
    </div>
  </div>
</div>

<style>
  .keymap {
    --u: clamp(1.9rem, 5.6vw, 3.1rem);
    --g: clamp(0.18rem, 0.7vw, 0.4rem);
  }
</style>
