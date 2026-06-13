<script lang="ts">
  import { lessons } from "$lib/engine";
  import { settings } from "$lib/state/settings.svelte";
  import Dialog from "./Dialog.svelte";

  let {
    open = $bindable(false),
    onpick,
  }: { open: boolean; onpick: (name: string) => void } = $props();

  let query = $state("");
  const filtered = $derived(
    query.trim()
      ? lessons.filter((l) => l.name.includes(query.trim()))
      : lessons,
  );

  function pick(name: string) {
    onpick(name);
    open = false;
  }
</script>

<Dialog bind:open title="เลือกบทเรียน">
  <div class="flex flex-col gap-4">
    <input
      type="search"
      bind:value={query}
      placeholder="ค้นหาบท เช่น ก, สระ, ไม้เอก…"
      class="font-thai w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-primary"
    />

    <ul class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {#each filtered as lesson (lesson.name)}
        {@const current = lesson.name === settings.currentLessonName}
        <li>
          <button
            type="button"
            onclick={() => pick(lesson.name)}
            class="flex w-full flex-col items-start gap-0.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors duration-150 {current
              ? 'border-primary bg-primary/8'
              : 'border-border hover:border-border-strong hover:bg-panel'}"
            aria-current={current ? "true" : undefined}
          >
            <span class="font-thai text-sm font-medium {current ? 'text-primary' : 'text-ink'}">
              {lesson.name}
            </span>
            <span class="font-thai truncate text-xs text-muted">
              {lesson.words.slice(0, 5).join("  ")}
            </span>
          </button>
        </li>
      {:else}
        <li class="col-span-full py-6 text-center text-sm text-muted">ไม่พบบทที่ค้นหา</li>
      {/each}
    </ul>
  </div>
</Dialog>
