<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    title,
    children,
  }: { open: boolean; title: string; children: Snippet } = $props();

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  });

  // Close when the backdrop (the dialog element itself) is clicked.
  function onclick(e: MouseEvent) {
    if (e.target === dialog) open = false;
  }
</script>

<dialog
  bind:this={dialog}
  onclose={() => (open = false)}
  {onclick}
  class="m-auto w-[min(34rem,92vw)] rounded-2xl border border-border bg-surface p-0 text-ink backdrop:bg-black/45 backdrop:backdrop-blur-[2px] open:animate-rise"
>
  <div class="flex items-center justify-between border-b border-border px-5 py-3.5">
    <h2 class="text-base font-semibold">{title}</h2>
    <button
      type="button"
      onclick={() => (open = false)}
      class="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
      aria-label="ปิด"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>
  </div>
  <div class="max-h-[70vh] overflow-y-auto px-5 py-4">
    {@render children()}
  </div>
</dialog>
