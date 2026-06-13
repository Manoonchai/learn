<script lang="ts">
  import { settings, type Mode } from "$lib/state/settings.svelte";

  let { onchange }: { onchange: (mode: Mode) => void } = $props();

  const modes: { value: Mode; label: string }[] = [
    { value: "lesson", label: "บทเรียน" },
    { value: "timeAttack", label: "จับเวลา" },
  ];
</script>

<div
  class="flex items-center gap-1 rounded-lg border border-border bg-bg p-1"
  role="group"
  aria-label="โหมด"
>
  {#each modes as m (m.value)}
    <button
      type="button"
      data-testid="mode-{m.value}"
      onclick={() => onchange(m.value)}
      aria-pressed={settings.mode === m.value}
      class="font-thai rounded-md px-3 py-1 text-sm transition-colors duration-150 {settings.mode ===
      m.value
        ? 'bg-primary text-primary-ink'
        : 'text-muted hover:text-ink'}"
    >
      {m.label}
    </button>
  {/each}
</div>
