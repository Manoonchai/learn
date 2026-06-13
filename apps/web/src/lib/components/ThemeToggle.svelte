<script lang="ts">
  import { settings, type Theme } from "$lib/state/settings.svelte";

  const order: Theme[] = ["system", "light", "dark"];
  const labels: Record<Theme, string> = {
    system: "ตามระบบ",
    light: "สว่าง",
    dark: "มืด",
  };

  function cycle() {
    const i = order.indexOf(settings.theme);
    settings.theme = order[(i + 1) % order.length];
  }
</script>

<button
  type="button"
  onclick={cycle}
  class="grid size-9 place-items-center rounded-lg border border-border text-muted transition-colors duration-150 hover:border-border-strong hover:text-ink"
  aria-label={`ธีม: ${labels[settings.theme]} (กดเพื่อเปลี่ยน)`}
  title={`ธีม: ${labels[settings.theme]}`}
>
  {#if settings.theme === "system"}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.7" />
      <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
    </svg>
  {:else if settings.theme === "light"}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  {:else}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 13.4A8 8 0 1 1 10.6 4a6.3 6.3 0 0 0 9.4 9.4Z"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linejoin="round"
      />
    </svg>
  {/if}
</button>
