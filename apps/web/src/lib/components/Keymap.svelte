<script lang="ts">
  import { LAYOUT_ROWS, isShifted } from "$lib/engine";
  import Key from "./Key.svelte";

  let { nextChar, glow }: { nextChar: string; glow: boolean } = $props();

  const shiftActive = $derived(isShifted(nextChar));
  const spaceActive = $derived(nextChar === " ");

  // Non-functional modifier caps that frame each row. They flex-grow equally so
  // every row fills the same width — left and right edges line up, and their
  // differing widths (Tab < Caps < Shift) produce the physical-keyboard stagger.
  const ROW_MODS = [
    { left: "Tab", right: "", shift: false },
    { left: "Caps Lock", right: "Enter", shift: false },
    { left: "Shift", right: "Shift", shift: true },
  ];
</script>

{#snippet cap(label: string, shift: boolean)}
  <div
    class="grid place-items-center overflow-hidden rounded-md border font-medium uppercase tracking-wide transition-colors duration-150
      {shift && shiftActive ? 'border-shift bg-shift/12 text-shift' : 'border-border bg-panel text-faint'}"
    style="flex: 1 1 0; min-width: 0; font-size: calc(var(--u) * 0.34)"
  >
    <span class="truncate px-1" style="font-size: 0.62em">{label}</span>
  </div>
{/snippet}

<div class="keymap mx-auto select-none" aria-hidden="true">
  <div class="keys">
    <!-- Letter rows, framed by placeholder modifiers like a physical board. -->
    <div class="flex flex-col gap-[var(--g)]">
      {#each LAYOUT_ROWS as row, r (r)}
        <div class="flex gap-[var(--g)]">
          {@render cap(ROW_MODS[r].left, ROW_MODS[r].shift)}
          {#each row as key (key.code)}
            <div class="key-slot shrink-0" style="width: var(--u); font-size: calc(var(--u) * 0.46)">
              <Key keyData={key} {nextChar} {glow} />
            </div>
          {/each}
          {#if ROW_MODS[r].right}
            {@render cap(ROW_MODS[r].right, ROW_MODS[r].shift)}
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
</div>

<style>
  /* The board is a size container; every key is sized in cqw off this width,
     so keys stay identical across rows at any viewport and columns never drift. */
  .keymap {
    container-type: inline-size;
    width: min(100%, 48rem);
  }

  /* Widest content is the top row: Tab + 13 keys + 13 gaps. With the side caps
     flex-growing to fill each row, dividing the board width by 16.25u lands the
     top→home stagger at 0.25u (and home→bottom at the exact half-key pitch). */
  .keys {
    --u: calc(100cqw / 16.25);
    --g: calc(var(--u) * 0.125);
  }
</style>
