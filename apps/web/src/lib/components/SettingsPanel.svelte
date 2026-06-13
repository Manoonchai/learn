<script lang="ts">
  import { DRILL_LENGTHS, type DrillLength } from "$lib/engine";
  import { settings, type CaretStyle, type Theme } from "$lib/state/settings.svelte";
  import Dialog from "./Dialog.svelte";

  let { open = $bindable(false) }: { open: boolean } = $props();

  const themes: { value: Theme; label: string }[] = [
    { value: "system", label: "ระบบ" },
    { value: "light", label: "สว่าง" },
    { value: "dark", label: "มืด" },
  ];

  const caretStyles: { value: CaretStyle; label: string }[] = [
    { value: "line", label: "เส้น" },
    { value: "block", label: "บล็อก" },
    { value: "underline", label: "ขีดล่าง" },
    { value: "off", label: "ปิด" },
  ];

  const toggles = $derived([
    { key: "showKeymap", label: "แสดงคีย์แมป", hint: "คีย์บอร์ดมนูญชัยบนหน้าจอ" },
    { key: "glow", label: "เรืองแสงปุ่มถัดไป", hint: "ไฮไลต์ปุ่มที่ต้องกดต่อไป" },
  ] as const);
</script>

<Dialog bind:open title="ตั้งค่า">
  <div class="flex flex-col gap-6">
    <!-- Drill length -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium">ความยาวต่อรอบ</span>
      <div class="grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-bg p-1">
        {#each DRILL_LENGTHS as len (len)}
          <button
            type="button"
            onclick={() => (settings.drillLength = len as DrillLength)}
            class="rounded-lg py-1.5 font-mono text-sm tabular-nums transition-colors duration-150 {settings.drillLength ===
            len
              ? 'bg-primary text-primary-ink'
              : 'text-muted hover:bg-panel hover:text-ink'}"
            aria-pressed={settings.drillLength === len}
          >
            {len}
          </button>
        {/each}
      </div>
    </div>

    <!-- Theme -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium">ธีม</span>
      <div class="grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-bg p-1">
        {#each themes as t (t.value)}
          <button
            type="button"
            onclick={() => (settings.theme = t.value)}
            class="rounded-lg py-1.5 text-sm transition-colors duration-150 {settings.theme ===
            t.value
              ? 'bg-primary text-primary-ink'
              : 'text-muted hover:bg-panel hover:text-ink'}"
            aria-pressed={settings.theme === t.value}
          >
            {t.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Caret style -->
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium">เคอร์เซอร์</span>
      <div class="grid grid-cols-4 gap-1.5 rounded-xl border border-border bg-bg p-1">
        {#each caretStyles as c (c.value)}
          <button
            type="button"
            onclick={() => (settings.caretStyle = c.value)}
            class="rounded-lg py-1.5 text-sm transition-colors duration-150 {settings.caretStyle ===
            c.value
              ? 'bg-primary text-primary-ink'
              : 'text-muted hover:bg-panel hover:text-ink'}"
            aria-pressed={settings.caretStyle === c.value}
          >
            {c.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Toggles -->
    <div class="flex flex-col divide-y divide-border">
      {#each toggles as t (t.key)}
        <label class="flex cursor-pointer items-center justify-between gap-4 py-3">
          <span class="flex flex-col">
            <span class="text-sm">{t.label}</span>
            <span class="text-xs text-muted">{t.hint}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings[t.key]}
            aria-label={t.label}
            onclick={() => (settings[t.key] = !settings[t.key])}
            class="relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 {settings[
              t.key
            ]
              ? 'bg-primary'
              : 'bg-border-strong'}"
          >
            <span
              class="absolute top-0.5 left-0.5 size-5 rounded-full bg-bg shadow-sm transition-transform duration-200 {settings[
                t.key
              ]
                ? 'translate-x-4'
                : ''}"
            ></span>
          </button>
        </label>
      {/each}
    </div>

    <p class="text-xs text-muted">
      <kbd class="font-mono">Tab</kbd> เริ่มรอบใหม่ ·
      <kbd class="font-mono">Esc</kbd> เปิดตั้งค่า
    </p>
  </div>
</Dialog>
