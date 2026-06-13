<script lang="ts">
  import { browser } from "$app/environment";
  import type { DrillResult } from "$lib/engine";
  import WpmChart from "./WpmChart.svelte";
  import ResultShare from "./ResultShare.svelte";

  // Gate the chart's JS-driven draw on reduced-motion (CSS can't stop it).
  const animate =
    browser && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let {
    result,
    lessonName,
    timeAttack = false,
    onRestart,
    onChangeLesson,
  }: {
    result: DrillResult;
    lessonName: string;
    timeAttack?: boolean;
    onRestart: () => void;
    onChangeLesson: () => void;
  } = $props();

  const secondary = $derived(
    timeAttack
      ? [
          { label: "raw wpm", value: result.rawWpm.toFixed(0) },
          { label: "ความแม่นยำ", value: `${result.accuracy.toFixed(0)}%` },
          { label: "ความสม่ำเสมอ", value: `${result.consistency.toFixed(0)}%` },
          { label: "เวลา", value: `${result.seconds.toFixed(0)}s` },
        ]
      : [
          { label: "raw wpm", value: result.rawWpm.toFixed(0) },
          { label: "ความแม่นยำ", value: `${result.accuracy.toFixed(0)}%` },
          { label: "ผิดพลาด", value: result.errors.toFixed(0) },
          { label: "เวลา", value: `${result.seconds.toFixed(0)}s` },
        ],
  );
</script>

<section
  data-testid="summary"
  class="animate-rise mx-auto flex w-full max-w-2xl flex-col items-center gap-8"
>
  <div class="text-center">
    <p class="font-thai text-sm text-muted">
      {timeAttack ? "จับเวลา · 60 วินาที" : `จบบท ${lessonName}`}
    </p>
    <div class="mt-1 flex items-end justify-center gap-3">
      <span
        data-testid="net-wpm"
        class="font-mono text-7xl leading-none font-bold tabular-nums text-accent sm:text-8xl"
      >
        {result.netWpm.toFixed(0)}
      </span>
      <span class="mb-2 text-sm tracking-wide text-muted uppercase">net wpm</span>
    </div>
  </div>

  <dl class="grid w-full grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
    {#each secondary as stat (stat.label)}
      <div class="flex flex-col items-center gap-1 bg-surface px-3 py-4">
        <dd class="font-mono text-2xl font-semibold tabular-nums text-ink">{stat.value}</dd>
        <dt class="font-thai text-xs text-muted">{stat.label}</dt>
      </div>
    {/each}
  </dl>

  <WpmChart samples={result.samples} {animate} />

  <div class="flex flex-wrap items-center justify-center gap-3">
    <button
      type="button"
      onclick={onRestart}
      class="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-ink transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.98]"
    >
      พิมพ์อีกครั้ง
      <kbd class="ml-1.5 font-mono text-xs opacity-70">Tab</kbd>
    </button>
    {#if !timeAttack}
      <button
        type="button"
        onclick={onChangeLesson}
        class="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-border-strong hover:bg-panel"
      >
        เปลี่ยนบท
      </button>
    {/if}
  </div>

  {#if timeAttack}
    <div class="flex flex-col items-center gap-2">
      <p class="font-thai text-xs text-faint">บันทึกหรือคัดลอกรูปผลลัพธ์เพื่อแชร์ใน Discord</p>
      <ResultShare {result} />
    </div>
  {/if}
</section>
